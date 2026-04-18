'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Trophy, TrendingUp, CreditCard, ArrowRight, Circle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Profile, GolfScore, Draw } from '@/lib/types'

interface Props {
  profile: Profile | null
  scores: GolfScore[]
  draws: Draw[]
}

function getScoreColor(score: number) {
  if (score >= 36) return 'text-emerald-400'
  if (score >= 28) return 'text-sky-400'
  if (score >= 20) return 'text-amber-400'
  return 'text-red-400'
}

function getAverage(scores: GolfScore[]) {
  if (!scores.length) return null
  return (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
}

function getPlayedDate(score: GolfScore) {
  return score.played_at
}

function getStatusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'inactive') return <Badge variant="default">Inactive</Badge>
  if (status === 'past_due') return <Badge variant="warning">Past Due</Badge>
  if (status === 'cancelled') return <Badge variant="danger">Cancelled</Badge>
  return <Badge variant="default">{status}</Badge>
}

export default function DashboardOverview({ profile, scores, draws }: Props) {
  const avg = getAverage(scores)
  const firstName = profile?.full_name?.split(' ')[0] || 'Player'

  const statsCards = [
    {
      label: 'Rolling Average',
      value: avg ? avg : '—',
      sub: avg ? 'Last 5 rounds' : 'No scores yet',
      icon: TrendingUp,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Scores Recorded',
      value: scores.length.toString(),
      sub: 'of 5 rolling slots',
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Subscription',
      value: profile?.subscription_status === 'active' ? 'Active' : 'Inactive',
      sub: profile?.subscription_status === 'active' ? '£5/month' : 'Subscribe to enter draws',
      icon: CreditCard,
      color: profile?.subscription_status === 'active' ? 'text-emerald-400' : 'text-amber-400',
      bg: profile?.subscription_status === 'active' ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
    {
      label: 'Active Draws',
      value: draws.length.toString(),
      sub: draws.length ? 'Draws available' : 'No draws yet',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Good to see you, {firstName}</h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s your performance snapshot</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="p-5 hover:border-[#2a3a4e] transition-colors duration-200">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-xs font-medium text-slate-300">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a]">
              <div>
                <h2 className="font-semibold text-white">Recent Scores</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest 5 Stableford rounds</p>
              </div>
              <Link href="/dashboard/scores">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {scores.length === 0 ? (
              <div className="p-10 text-center">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No scores recorded yet</p>
                <Link href="/dashboard/scores">
                  <Button variant="outline" size="sm" className="mt-4">
                    Add Your First Score
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2a3a]">
                {scores.map((score, i) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#1e2a3a] flex items-center justify-center text-xs font-bold text-slate-300">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {score.course_name || 'Round ' + (i + 1)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(getPlayedDate(score)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${getScoreColor(score.score)}`}>
                      {score.score}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a]">
              <div>
                <h2 className="font-semibold text-white">Upcoming Draws</h2>
                <p className="text-xs text-slate-500 mt-0.5">Monthly charity prize draws</p>
              </div>
              <Link href="/dashboard/draws">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {draws.length === 0 ? (
              <div className="p-10 text-center">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No draws active right now</p>
                <p className="text-xs text-slate-500 mt-1">Check back soon for new draws</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2a3a]">
                {draws.map((draw, i) => (
                  <motion.div
                    key={draw.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle className="w-1.5 h-1.5 text-emerald-400 fill-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white truncate">{draw.title}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Draw: {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {draw.charity && (
                          <p className="text-xs text-sky-400 mt-0.5">{(draw.charity as { name: string }).name}</p>
                        )}
                      </div>
                      <Badge variant={draw.status === 'active' ? 'success' : 'info'}>
                        {draw.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {profile?.subscription_status !== 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 rounded-xl bg-sky-500/8 border border-sky-500/20"
            >
              <p className="text-sm text-sky-300 font-medium mb-1">Activate your subscription</p>
              <p className="text-xs text-slate-400 mb-3">Subscribe for £5/month to enter charity draws and track your performance.</p>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  Subscribe Now <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
