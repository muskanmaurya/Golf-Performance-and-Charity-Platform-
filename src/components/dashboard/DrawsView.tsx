'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Gift, CircleCheck as CheckCircle2, Lock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Draw } from '@/lib/types'

interface Props {
  draws: Draw[]
  subscriptionStatus: string
  userId: string
}

export default function DrawsView({ draws: initialDraws, subscriptionStatus, userId }: Props) {
  const [draws, setDraws] = useState(initialDraws)
  const [entering, setEntering] = useState<string | null>(null)
  const isSubscribed = subscriptionStatus === 'active'

  async function handleEnter(drawId: string) {
    if (!isSubscribed) return
    setEntering(drawId)
    const supabase = createClient()
    const { error } = await supabase
      .from('draw_entries')
      .insert({ draw_id: drawId, user_id: userId })

    if (!error) {
      setDraws(prev => prev.map(d => d.id === drawId ? { ...d, user_entered: true } : d))
    }
    setEntering(null)
  }

  const upcoming = draws.filter(d => d.status === 'upcoming' || d.status === 'active')
  const completed = draws.filter(d => d.status === 'completed')

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Prize Draws</h1>
        <p className="text-slate-400 text-sm mt-1">Monthly charity draws — exclusive to active subscribers</p>
      </motion.div>

      {!isSubscribed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-3 mb-8"
        >
          <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium text-sm">Subscription Required</p>
            <p className="text-slate-400 text-sm mt-1">
              Active subscribers are automatically entered into monthly draws. Subscribe for £5/month to participate.
            </p>
          </div>
        </motion.div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Active & Upcoming</h2>
          <div className="grid gap-4">
            {upcoming.map((draw, i) => {
              const charity = draw.charity as { name: string; description: string } | undefined
              return (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={`p-6 ${draw.user_entered ? 'border-emerald-500/25' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-white">{draw.title}</h3>
                            <Badge variant={draw.status === 'active' ? 'success' : 'info'}>
                              {draw.status}
                            </Badge>
                          </div>
                          {charity && (
                            <p className="text-xs text-sky-400 mb-2">Supporting {charity.name}</p>
                          )}
                          {draw.description && (
                            <p className="text-sm text-slate-400 mb-3">{draw.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Draw: {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {draw.prize_description && (
                              <span className="flex items-center gap-1">
                                <Gift className="w-3.5 h-3.5 text-amber-400/70" />
                                <span className="text-amber-400/70">{draw.prize_description}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {draw.user_entered ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Entered
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleEnter(draw.id)}
                            loading={entering === draw.id}
                            disabled={!isSubscribed}
                            variant={isSubscribed ? 'secondary' : 'ghost'}
                            size="sm"
                          >
                            {isSubscribed ? 'Enter Draw' : <><Lock className="w-3.5 h-3.5" /> Locked</>}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Past Draws</h2>
          <div className="grid gap-3">
            {completed.map((draw, i) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-300 text-sm">{draw.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Completed {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {draws.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">No draws yet</p>
          <p className="text-slate-500 text-sm mt-1">Check back soon — draws are added monthly</p>
        </div>
      )}
    </div>
  )
}
