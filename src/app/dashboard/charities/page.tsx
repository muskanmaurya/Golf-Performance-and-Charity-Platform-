import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharitiesView from '@/components/dashboard/CharitiesView'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const orderedQuery = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  let charities = orderedQuery.data

  // Some environments were created without `created_at`; fallback avoids empty pages.
  if (orderedQuery.error) {
    console.warn('Charities ordered fetch failed, retrying without created_at:', orderedQuery.error)
    const fallbackQuery = await supabase
      .from('charities')
      .select('*')

    if (fallbackQuery.error) {
      console.error('Charities fallback fetch error:', fallbackQuery.error)
      charities = []
    } else {
      charities = (fallbackQuery.data ?? []).sort((a, b) =>
        String(a?.name ?? '').localeCompare(String(b?.name ?? ''))
      )
    }
  }

  return <CharitiesView charities={charities ?? []} />
}
