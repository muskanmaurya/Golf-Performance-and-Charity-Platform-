import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoresManager from '@/components/dashboard/ScoresManager'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: scores } = await supabase
    .from('golf_scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(5)

  return <ScoresManager initialScores={scores ?? []} userId={user.id} />
}
