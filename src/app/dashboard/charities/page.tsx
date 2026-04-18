import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharitiesView from '@/components/dashboard/CharitiesView'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return <CharitiesView charities={charities ?? []} />
}
