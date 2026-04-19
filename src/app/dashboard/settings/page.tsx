import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import SettingsPageClient from '@/components/settings/SettingsPageClient'
import type { Profile, Subscription, Charity } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Settings | Digital Heroes',
  description: 'Manage your account settings and preferences',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function fetchData(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const [profileResult, charityResult, subscriptionResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('charities').select('*').eq('is_active', true),
    supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).maybeSingle(),
  ])

  return {
    profile: profileResult.data as Profile | null,
    charities: (charityResult.data || []) as Charity[],
    subscription: subscriptionResult.data as Subscription | null,
  }
}

async function fetchSelectedCharity(supabase: Awaited<ReturnType<typeof createClient>>, charityId: string | null | undefined) {
  if (!charityId) return null

  const { data } = await supabase.from('charities').select('*').eq('id', charityId).maybeSingle()

  return (data || null) as Charity | null
}

async function resolveAvatarUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  avatarValue: string | null | undefined
): Promise<string> {
  if (!avatarValue) return ''

  let filePath = avatarValue
  const marker = '/avatars/'
  const markerIndex = avatarValue.indexOf(marker)
  if (markerIndex >= 0) {
    filePath = avatarValue.slice(markerIndex + marker.length).split('?')[0]
  }

  if (!filePath.includes('/')) {
    return avatarValue
  }

  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(filePath, 60 * 60)
  if (error || !data?.signedUrl) {
    return avatarValue
  }

  return data.signedUrl
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const stripePriceIdMonthly = process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.STRIPE_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? ''
  const stripePriceIdYearly = process.env.STRIPE_PRICE_ID_YEARLY ?? ''

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { profile, charities, subscription } = await fetchData(supabase, user.id)

  if (!profile) {
    redirect('/auth/login')
  }

  const authFullName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()) ||
    ''

  const resolvedProfile: Profile = {
    ...profile,
    email: profile.email || user.email || '',
    full_name: profile.full_name || authFullName,
  }

  resolvedProfile.avatar_url = await resolveAvatarUrl(supabase, resolvedProfile.avatar_url)

  const selectedCharity = await fetchSelectedCharity(supabase, resolvedProfile.preferred_charity_id)

  return (
    <SettingsPageClient
      profile={resolvedProfile}
      authEmail={user.email || resolvedProfile.email || ''}
      selectedCharity={selectedCharity}
      charities={charities}
      subscription={subscription}
      stripePriceIdMonthly={stripePriceIdMonthly}
      stripePriceIdYearly={stripePriceIdYearly}
    />
  )
}
