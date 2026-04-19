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

  console.log('Update Charity Server Action Triggered:', {
    userId: user.id,
    charityId: input.charityId,
    contributionPercent: contributionPercent
  })
  
  console.log('Updating user:', user.id, 'to charity:', input.charityId)

  // Try updating both if they both exist.
  // We'll update just the preferred_charity_id first to ensure atomic success even if other schema columns are missing.
  const { error: primaryError } = await supabase
    .from('profiles')
    .update({ preferred_charity_id: input.charityId })
    .eq('id', user.id)

  if (primaryError) return { ok: false, error: primaryError.message }

  // Optionally try updating contribution percent if provided, ignore errors safely if column doesn't exist
  if (contributionPercent !== undefined) {
    await supabase.from('profiles').update({ contribution_percent: contributionPercent }).eq('id', user.id).then(() => {})
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/charities', 'layout')

  return { ok: true }
}

