'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AddScoreResult =
  | { ok: true }
  | { ok: false; error: string }

function normalizeCalendarDate(value: string): string {
  return value.trim().slice(0, 10)
}

function rowPlayedDate(row: { played_at: string }): string {
  return normalizeCalendarDate(row.played_at)
}

export async function addScore(score: number, played_at: string): Promise<AddScoreResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'You must be signed in to save a score.' }
  }

  if (!Number.isInteger(score) || score < 1 || score > 45) {
    return { ok: false, error: 'Score must be a whole number between 1 and 45.' }
  }

  const normalizedPlayedAt = normalizeCalendarDate(played_at)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedPlayedAt)) {
    return { ok: false, error: 'Invalid played_at date.' }
  }

  const { data: rows, error: fetchError } = await supabase
    .from('golf_scores')
    .select('id, played_at, created_at')
    .eq('user_id', user.id)

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  const list = rows ?? []
  const duplicate = list.some((r) => rowPlayedDate(r) === normalizedPlayedAt)
  if (duplicate) {
    return { ok: false, error: 'You already have a score for that date.' }
  }

  if (list.length >= 5) {
    const sorted = [...list].sort((a, b) => {
      const da = rowPlayedDate(a)
      const db = rowPlayedDate(b)
      if (da !== db) return da.localeCompare(db)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    const oldest = sorted[0]
    const { error: deleteError } = await supabase.from('golf_scores').delete().eq('id', oldest.id)
    if (deleteError) {
      return { ok: false, error: deleteError.message }
    }
  }

  const { error: insertError } = await supabase
    .from('golf_scores')
    .insert({
      user_id: user.id,
      score,
      played_at: normalizedPlayedAt,
    })

  if (insertError) {
    return { ok: false, error: insertError.message }
  }

  revalidatePath('/dashboard')

  return { ok: true }
}
