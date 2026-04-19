'use client'

import { motion } from 'framer-motion'
import { Heart, Globe, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { Charity } from '@/lib/types'
import { setPreferredCharity } from '@/app/actions/charity'

export default function CharitiesView({ charities }: { charities: Charity[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [loadingCharityId, setLoadingCharityId] = useState<string | null>(null)

  const handleSelectCharity = async (charityId: string) => {
    setLoadingCharityId(charityId)
    startTransition(async () => {
      const res = await setPreferredCharity({ charityId })
      setLoadingCharityId(null)
      if (res.ok) {
        router.refresh()
        window.location.reload()
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Charities</h1>
        <p className="text-slate-400 text-sm mt-1">Our verified partners — your subscription helps fund real impact.</p>
      </motion.div>

      {charities.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">No charities available yet</p>
          <p className="text-slate-500 text-sm mt-1">Check back soon — admins add partners regularly.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-5 h-full hover:border-[#2a3a4e] transition-colors duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{c.name}</h3>
                    {c.description && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-3">{c.description}</p>
                    )}
                    <div className="text-xs text-slate-500 mt-3 flex justify-between items-center">
                      <span>Total raised: £{(c.total_raised_pence / 100).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleSelectCharity(c.id)}
                        loading={loadingCharityId === c.id}
                      >
                        Select Charity
                      </Button>
                      {c.website_url && (
                        <a
                          href={c.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                        >
                          <Button variant="ghost" size="sm">
                            <Globe className="w-3.5 h-3.5" />
                            Website <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

