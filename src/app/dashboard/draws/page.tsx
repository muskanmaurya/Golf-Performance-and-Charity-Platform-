import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DrawsView from '@/components/dashboard/DrawsView'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, drawsRes, entriesRes] = await Promise.all([
    supabase.from('profiles').select('subscription_status').eq('id', user.id).maybeSingle(),
    supabase
      .from('draws')
      .select('*, charity:charities(name, description)')
      .neq('status', 'cancelled')
      .order('draw_date', { ascending: true }),
    supabase.from('draw_entries').select('draw_id').eq('user_id', user.id),
  ])

  const enteredDrawIds = new Set((entriesRes.data ?? []).map(e => e.draw_id))

  const draws = (drawsRes.data ?? []).map(d => ({
    ...d,
    user_entered: enteredDrawIds.has(d.id),
  }))

  return (
    <DrawsView
      draws={draws}
      subscriptionStatus={profileRes.data?.subscription_status ?? 'inactive'}
      userId={user.id}
    />
  )
}
