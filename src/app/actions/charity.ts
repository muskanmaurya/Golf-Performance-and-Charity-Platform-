'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SetCharityResult = { ok: true } | { ok: false; error: string }

export async function setPreferredCharity(input: {
  charityId: string
  contributionPercent?: number
}): Promise<SetCharityResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'You must be signed in.' }

  const contributionPercent = input.contributionPercent ?? 10
  if (!Number.isFinite(contributionPercent) || contributionPercent <= 0 || contributionPercent > 100) {
    return { ok: false, error: 'Contribution percentage must be between 1 and 100.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      preferred_charity_id: input.charityId,
      contribution_percent: contributionPercent,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/charities')

  return { ok: true }
}

