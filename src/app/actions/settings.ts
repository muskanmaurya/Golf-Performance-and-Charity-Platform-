'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getStripeClient } from '@/lib/stripe'

export type SettingsResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export type AvatarUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

function isMissingColumnError(errorMessage: string, columnName: string) {
  const message = errorMessage.toLowerCase()
  return message.includes('could not find') && message.includes(columnName.toLowerCase())
}

async function ensureAvatarsBucketExists() {
  const supabaseAdmin = getSupabaseAdminClient()
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

  if (listError) {
    return
  }

  const hasAvatarsBucket = (buckets ?? []).some((bucket) => bucket.name === 'avatars')
  if (hasAvatarsBucket) {
    return
  }

  await supabaseAdmin.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
}

/**
 * Update profile information (name, display name, email preferences)
 */
export async function updateProfile(
  fullName: string,
  preferredCharityId?: string | null,
  autoContributionPercent?: number,
  displayName?: string | null
): Promise<SettingsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    const payload: Record<string, unknown> = {
      full_name: fullName.trim(),
      ...(preferredCharityId !== undefined && { preferred_charity_id: preferredCharityId }),
      ...(autoContributionPercent !== undefined && { contribution_percent: autoContributionPercent }),
    }

    if (displayName !== undefined) {
      payload.display_name = displayName ? displayName.trim() : null
    }

    let { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)

    // Backward-compatible fallback for schemas without display_name
    if (error && displayName !== undefined && isMissingColumnError(error.message, 'display_name')) {
      const { display_name: _removed, ...fallbackPayload } = payload
      const fallbackResult = await supabase
        .from('profiles')
        .update(fallbackPayload)
        .eq('id', user.id)
      error = fallbackResult.error
    }

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true, message: 'Profile updated successfully.' }
  } catch (err) {
    console.error('Update profile error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update profile.' }
  }
}

export async function updateCharityPreference(charityId: string): Promise<SettingsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_charity_id: charityId,
      })
      .eq('id', user.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true, message: 'Charity updated successfully.' }
  } catch (err) {
    console.error('Update charity preference error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update charity preference.' }
  }
}

export async function updateContributionPercent(percent: number): Promise<SettingsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    const safePercent = Math.max(0, Math.min(100, Math.round(percent)))

    const { error } = await supabase
      .from('profiles')
      .update({
        contribution_percent: safePercent,
      })
      .eq('id', user.id)

    if (error) {
      return { ok: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true, message: 'Contribution percentage updated.' }
  } catch (err) {
    console.error('Update contribution percent error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update contribution percentage.' }
  }
}

/**
 * Upload avatar to Supabase Storage and update profile
 */
export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
  try {
    const supabase = await createClient()
    const supabaseAdmin = getSupabaseAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { ok: false, error: 'No file provided.' }
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return { ok: false, error: 'File must be an image.' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: 'File size must be less than 5MB.' }
    }

    await ensureAvatarsBucketExists()

    // Delete old avatar if exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/').pop()
      if (oldPath) {
        await supabaseAdmin.storage.from('avatars').remove([`${user.id}/${oldPath}`])
      }
    }

    // Upload new avatar
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage.from('avatars').upload(filePath, file, {
      upsert: false,
    })

    if (uploadError) {
      return { ok: false, error: uploadError.message }
    }

    // Get public URL (works if bucket is public)
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('avatars').getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
      })
      .eq('id', user.id)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true, url: `${publicUrl}?v=${Date.now()}` }
  } catch (err) {
    console.error('Avatar upload error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to upload avatar.' }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  drawEmailNotifications: boolean,
  weeklyReports: boolean
): Promise<SettingsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    // Check if notification prefs table exists, else store in profile or separate table
    // For now, store as JSON in a new column if adding to profiles table is needed
    // Or create a separate notifications table

    // This is a placeholder - you may want to add notification_preferences as JSON to profiles
    // const { error } = await supabase
    //   .from('profiles')
    //   .update({
    //     notification_preferences: {
    //       draw_emails: drawEmailNotifications,
    //       weekly_reports: weeklyReports,
    //     },
    //   })
    //   .eq('id', user.id)

    revalidatePath('/dashboard/settings')
    return { ok: true, message: 'Notification preferences updated.' }
  } catch (err) {
    console.error('Update notification preferences error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to update preferences.' }
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<SettingsResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, message: 'Password reset email sent. Check your inbox.' }
  } catch (err) {
    console.error('Password reset error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to send reset email.' }
  }
}

/**
 * Delete user account and all associated data
 */
export async function deleteAccount(password: string): Promise<SettingsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    // Verify password by attempting to reauthenticate
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password,
    })

    if (signInError) {
      return { ok: false, error: 'Invalid password. Please try again.' }
    }

    // Delete user data using admin client
    const supabaseAdmin = getSupabaseAdminClient()

    // Delete all related data (golf scores, draw entries, etc.)
    await Promise.all([
      supabaseAdmin.from('golf_scores').delete().eq('user_id', user.id),
      supabaseAdmin.from('draw_entries').delete().eq('user_id', user.id),
    ])

    // Delete profile
    const { error: deleteProfileError } = await supabaseAdmin.from('profiles').delete().eq('id', user.id)

    if (deleteProfileError) {
      return { ok: false, error: deleteProfileError.message }
    }

    // Delete from Stripe if customer exists
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.stripe_customer_id) {
        const stripe = getStripeClient()
        await stripe.customers.del(profile.stripe_customer_id)
      }
    } catch (stripeErr) {
      console.warn('Failed to delete Stripe customer:', stripeErr)
    }

    // Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteAuthError) {
      return { ok: false, error: deleteAuthError.message }
    }

    // Sign out after deletion
    await supabase.auth.signOut()

    return { ok: true, message: 'Account deleted successfully.' }
  } catch (err) {
    console.error('Delete account error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to delete account.' }
  }
}

/**
 * Get Stripe Customer Portal session URL
 */
export async function getCustomerPortalUrl(): Promise<SettingsResult & { url?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: 'You must be signed in.' }
    }

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile?.stripe_customer_id) {
      return { ok: false, error: 'No subscription found. Please subscribe first.' }
    }

    const stripe = getStripeClient()

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/settings`,
    })

    return { ok: true, url: session.url }
  } catch (err) {
    console.error('Customer portal error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to create portal session.' }
  }
}
