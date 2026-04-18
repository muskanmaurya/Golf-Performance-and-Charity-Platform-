'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import type { GolfScore } from '@/lib/types'

interface Props {
  initialScores: GolfScore[]
  userId: string
}

function getScoreLabel(score: number) {
  if (score >= 36) return { label: 'Excellent', variant: 'success' as const }
  if (score >= 28) return { label: 'Good', variant: 'info' as const }
  if (score >= 20) return { label: 'Average', variant: 'warning' as const }
  return { label: 'Below Par', variant: 'danger' as const }
}

function getScoreBar(score: number) {
  return Math.min(100, (score / 45) * 100)
}

function getPlayedDate(score: GolfScore) {
  return score.played_at
}

export default function ScoresManager({ initialScores, userId }: Props) {
  const [scores, setScores] = useState<GolfScore[]>(initialScores)
  const [scoreInput, setScoreInput] = useState('')
  const [courseName, setCourseName] = useState('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  const avg = scores.length
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
    : null

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const scoreNum = parseInt(scoreInput)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45')
      return
    }
    if (scores.length >= 5) {
      setError('Maximum 5 rolling scores. Delete an old score to add a new one.')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('golf_scores')
      .insert({ user_id: userId, score: scoreNum, course_name: courseName, played_at: playedAt, notes })
      .select()
      .single()

    if (dbError) {
      setError(dbError.message)
    } else {
      setScores(prev => [data, ...prev].slice(0, 5))
      setScoreInput('')
      setCourseName('')
      setNotes('')
      setShowForm(false)
      setSuccessMsg('Score added successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('golf_scores').delete().eq('id', id)
    if (!dbError) {
      setScores(prev => prev.filter(s => s.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Golf Scores</h1>
          <p className="text-slate-400 text-sm mt-1">Track your Stableford performance — rolling 5 rounds</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'ghost' : 'primary'}
          size="sm"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Score</>}
        </Button>
      </motion.div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-6" glow>
              <h3 className="font-semibold text-white mb-5">New Round Entry</h3>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                    Stableford Score <span className="text-slate-500">(1–45)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={scoreInput}
                      onChange={e => setScoreInput(e.target.value)}
                      placeholder="Enter score"
                      required
                      className="w-40 px-4 py-2.5 rounded-xl bg-[#080b12] border border-[#1e2a3a] text-[#e8eaf0] placeholder-slate-500 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10 transition-all"
                    />
                    {scoreInput && !isNaN(parseInt(scoreInput)) && (
                      <Badge variant={getScoreLabel(parseInt(scoreInput)).variant}>
                        {getScoreLabel(parseInt(scoreInput)).label}
                      </Badge>
                    )}
                  </div>
                </div>

                <Input
                  label="Course Name (optional)"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  placeholder="e.g. St Andrews"
                />

                <Input
                  label="Round Date"
                  type="date"
                  value={playedAt}
                  onChange={e => setPlayedAt(e.target.value)}
                  required
                />

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any notes about this round..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080b12] border border-[#1e2a3a] text-[#e8eaf0] placeholder-slate-500 text-sm outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-3 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" loading={loading}>Save Score</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Rolling Average', value: avg ?? '—', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Best Score', value: scores.length ? Math.max(...scores.map(s => s.score)) : '—', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Scores Tracked', value: `${scores.length}/5`, icon: Info, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-[#1e2a3a]">
          <h2 className="font-semibold text-white">Score History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Rolling 5-round tracker — oldest is replaced when you add new scores</p>
        </div>

        {scores.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-1">No rounds recorded</p>
            <p className="text-slate-500 text-sm">Add your first Stableford score above</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2a3a]">
            {scores.map((score, i) => {
              const { label, variant } = getScoreLabel(score.score)
              const bar = getScoreBar(score.score)
              return (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#1e2a3a] flex items-center justify-center text-xs font-bold text-slate-300">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {score.course_name || 'Unnamed Round'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(getPlayedDate(score)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">{score.score}</div>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <button
                        onClick={() => handleDelete(score.id)}
                        disabled={deleting === score.id}
                        className="w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-[#1e2a3a] rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bar}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                    />
                  </div>
                  {score.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic">{score.notes}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
