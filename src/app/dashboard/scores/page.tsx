import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoresManager from '@/components/dashboard/ScoresManager'

export default async function ScoresPage() {
  const supabase = await createClient()
  const stripePriceIdMonthly =
    process.env.STRIPE_PRICE_ID_MONTHLY ??
    process.env.STRIPE_PRICE_ID ??
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ??
    ''
  const stripePriceIdYearly = process.env.STRIPE_PRICE_ID_YEARLY ?? ''
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, scoresRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(5),
  ])

  return (
    <ScoresManager
      initialScores={scoresRes.data ?? []}
      userId={user.id}
      subscriptionStatus={profileRes.data?.subscription_status ?? 'inactive'}
      stripePriceIdMonthly={stripePriceIdMonthly}
      stripePriceIdYearly={stripePriceIdYearly}
    />
  )
}
