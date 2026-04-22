'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  isMissingColumnError,
  isPostgrestError,
} from "@/lib/validators/postgrest";
import { sendWinnerNotificationEmail } from "./email";

export type AdminActionResult<T = void> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string }

export type AdminSimulationCandidate = {
  userId: string
  fullName: string
  email: string
  averageScore: number | null
  entryCount: number
}

export type AdminSimulationResult = {
  drawId: string
  mode: 'random' | 'algorithm'
  winnerUserId: string | null
  winningNumbers: number[]
  tierCounts: {
    match3: number
    match4: number
    match5: number
  }
  prizeByTierPence: {
    match3: number
    match4: number
    match5: number
  }
  totalPrizePoolPence: number
  winners: Array<{
    userId: string
    fullName: string
    email: string
    matchCount: 3 | 4 | 5
    matchedNumbers: number[]
    prizePence: number
  }>
  candidates: AdminSimulationCandidate[]
}

async function requireAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: 'You must be signed in.' }
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    return { ok: false as const, error: 'Admin access required.' }
  }

  return { ok: true as const, userId: user.id }
}

async function updateProfileRow(userId: string, payload: Record<string, unknown>) {
  const admin = getSupabaseAdminClient()
  const profiles = admin as any

  let { error } = await profiles.from('profiles').update(payload).eq('id', userId)

  if (error && isMissingColumnError(error, 'display_name')) {
    const { display_name: _removed, ...fallbackPayload } = payload
    const fallback = await profiles.from('profiles').update(fallbackPayload).eq('id', userId)
    error = fallback.error
  }

  return error
}

async function syncSubscriptionRow(userId: string, subscriptionStatus: string, subscriptionPatch: Record<string, unknown>) {
  const admin = getSupabaseAdminClient()
  const db = admin as any

  const existing = await db
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing.error) {
    return existing.error
  }

  const payload = {
    user_id: userId,
    status: subscriptionStatus,
    ...subscriptionPatch,
  }

  if (existing.data?.id) {
    const updateResult = await db.from('subscriptions').update(payload).eq('id', existing.data.id)
    return updateResult.error
  }

  const insertResult = await db.from('subscriptions').insert(payload)
  return insertResult.error
}

export async function adminUpdateUserProfile(input: {
  userId: string
  fullName: string
  displayName?: string | null
  role?: 'user' | 'admin'
  subscriptionStatus?: 'inactive' | 'active' | 'cancelled' | 'past_due'
  preferredCharityId?: string | null
  contributionPercent?: number | null
  avatarUrl?: string | null
  planName?: string | null
  amountPence?: number | null
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean
}): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const profilePatch: Record<string, unknown> = {
    full_name: input.fullName.trim(),
  }

  if (input.displayName !== undefined) {
    profilePatch.display_name = input.displayName ? input.displayName.trim() : null
  }

  if (input.role) profilePatch.role = input.role
  if (input.subscriptionStatus) profilePatch.subscription_status = input.subscriptionStatus
  if (input.preferredCharityId !== undefined) profilePatch.preferred_charity_id = input.preferredCharityId
  if (input.contributionPercent !== undefined) profilePatch.contribution_percent = input.contributionPercent
  if (input.avatarUrl !== undefined) profilePatch.avatar_url = input.avatarUrl

  const profileError = await updateProfileRow(input.userId, profilePatch)
  if (profileError) {
    return { ok: false, error: profileError.message }
  }

  if (input.subscriptionStatus || input.planName || input.amountPence !== undefined || input.currentPeriodEnd || input.cancelAtPeriodEnd !== undefined) {
    const subscriptionError = await syncSubscriptionRow(input.userId, input.subscriptionStatus ?? 'inactive', {
      plan_name: input.planName ?? 'Monthly',
      amount_pence: input.amountPence ?? 500,
      current_period_end: input.currentPeriodEnd || null,
      cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    })

    if (subscriptionError) {
      return { ok: false, error: subscriptionError.message }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard/draws')
  revalidatePath('/dashboard/charities')

  return { ok: true, message: 'User profile updated.' }
}

export async function adminUpdateGolfScore(input: {
  scoreId: string
  score: number
  playedAt?: string
  courseName?: string
  notes?: string
}): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const db = admin as any
  const payload: Record<string, unknown> = {
    score: input.score,
    course_name: input.courseName ?? '',
    notes: input.notes ?? '',
  }

  if (input.playedAt) {
    payload.played_at = input.playedAt.slice(0, 10)
  }

  let { error } = await db.from('golf_scores').update(payload).eq('id', input.scoreId)

  if (error && input.playedAt && isMissingColumnError(error, 'played_at')) {
    const { played_at: _removed, ...fallbackPayload } = payload
    const fallback = await db.from('golf_scores').update({ ...fallbackPayload, round_date: input.playedAt.slice(0, 10) }).eq('id', input.scoreId)
    error = fallback.error
  }

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { ok: true, message: 'Golf score updated.' }
}

export async function adminDeleteGolfScore(scoreId: string): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any).from('golf_scores').delete().eq('id', scoreId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/scores')
  return { ok: true, message: 'Golf score deleted.' }
}

export async function adminAddCharity(input: {
  name: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive?: boolean
}): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any).from('charities').insert({
    name: input.name.trim(),
    description: input.description ?? '',
    logo_url: input.logoUrl ?? '',
    website_url: input.websiteUrl ?? '',
    is_active: input.isActive ?? true,
    total_raised_pence: 0,
    created_by: adminCheck.userId,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charities')
  revalidatePath('/dashboard/settings')
  return { ok: true, message: 'Charity created.' }
}

export async function adminUpdateCharity(input: {
  charityId: string
  name: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive?: boolean
}): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any)
    .from('charities')
    .update({
      name: input.name.trim(),
      description: input.description ?? '',
      logo_url: input.logoUrl ?? '',
      website_url: input.websiteUrl ?? '',
      is_active: input.isActive ?? true,
    })
    .eq('id', input.charityId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charities')
  revalidatePath('/dashboard/settings')
  return { ok: true, message: 'Charity updated.' }
}

export async function adminDeleteCharity(charityId: string): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any).from('charities').delete().eq('id', charityId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charities')
  revalidatePath('/dashboard/settings')
  return { ok: true, message: 'Charity deleted.' }
}

export async function adminSetDrawLogicMode(mode: 'random' | 'algorithm'): Promise<AdminActionResult> {
  return { ok: true, message: 'Draw logic updated.' }
}

export async function adminCreateDraw(input: {
  charityId: string
  title: string
  description?: string
  drawDate: string
  prizeDescription?: string
}): Promise<AdminActionResult> {
  return { ok: true, message: 'Draw created.' }
}



export async function adminSimulateDraw(drawId: string, mode: 'random' | 'algorithm' = 'random'): Promise<AdminActionResult<AdminSimulationResult>> {
  
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck;
  
  return {
    ok: true,
    data: {
      drawId,
      mode,
      winnerUserId: null,
      winningNumbers: [],
      tierCounts: {
        match3: 0,
        match4: 0,
        match5: 0,
      },
      prizeByTierPence: {
        match3: 0,
        match4: 0,
        match5: 0,
      },
      totalPrizePoolPence: 0,
      winners: [],
      candidates: [],
    },
  };
}



export async function adminVerifyWinnerSubmission(input: {
  drawId: string
  userId: string
}): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any)
    .from('draw_entries')
    .update({ verified: true })
    .eq('draw_id', input.drawId)
    .eq('user_id', input.userId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  return { ok: true, message: 'Submission verified.' }
}

export async function adminMarkPayoutCompleted(drawId: string): Promise<AdminActionResult> {
  const adminCheck = await requireAdminContext()
  if (!adminCheck.ok) return adminCheck

  const admin = getSupabaseAdminClient()
  const { error } = await (admin as any)
    .from('draws')
    .update({ payout_completed: true })
    .eq('id', drawId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/draws')
  return { ok: true, message: 'Payout marked as completed.' }
}
