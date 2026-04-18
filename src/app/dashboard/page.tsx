import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscriberDashboard from '@/components/dashboard/SubscriberDashboard'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function fetchProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Profile | null> {
  try {
    const explicit = await supabase
      .from('profiles')
      .select('id, email, full_name, role, subscription_status, stripe_customer_id, avatar_url, preferred_charity_id, contribution_percent, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()

    if (!explicit.error && explicit.data) {
      return {
        ...explicit.data,
        contribution_percent: explicit.data.contribution_percent ?? 10,
      }
    }

    const fallback = await supabase
      .from('profiles')
      .select('id, email, full_name, role, subscription_status, stripe_customer_id, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()

    if (!fallback.error && fallback.data) {
      return {
        ...fallback.data,
        preferred_charity_id: null,
        contribution_percent: 10,
      }
    }
  } catch {
    // Defensive fallback in case Supabase schema cache is stale during deployment.
  }

  return null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, scoresResult, charitiesResult, nextDrawResult, winningsResult] = await Promise.all([
    fetchProfile(supabase, user.id),
    supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false, nullsFirst: false })
      .limit(5),
    supabase
      .from('charities')
      .select('*'),
    supabase
      .from('draws')
      .select('*, charity:charities(name, description)')
      .in('status', ['upcoming', 'active'])
      .order('draw_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    // Prize amounts aren't stored in schema, so winnings are represented as £0 until a payout ledger exists.
    supabase.from('draws').select('id').eq('winner_user_id', user.id),
  ])

  console.log('Charities data:', charitiesResult.data)

  return (
    <SubscriberDashboard
      profile={profile}
      scores={scoresResult.data ?? []}
      charities={charitiesResult.data ?? []}
      nextDraw={nextDrawResult.data ?? null}
      winningsPence={0}
    />
  )
}
