'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, Minus } from 'lucide-react'
import { updateContributionPercent } from '@/app/actions/settings'
import type { ToastType } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import type { Profile, Charity } from '@/lib/types'

interface CharityPreferenceProps {
  profile: Profile
  charities: Charity[]
  selectedCharity: Charity | null
  onChangeCharity: () => void
  onToast: (message: string, type?: ToastType) => void
}

export default function CharityPreferenceSection({
  profile,
  charities,
  selectedCharity,
  onChangeCharity,
  onToast,
}: CharityPreferenceProps) {
  const [contributionPercent, setContributionPercent] = useState(profile.contribution_percent ?? 10)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleContributionChange = async (newPercent: number) => {
    if (newPercent < 0 || newPercent > 100) return
    setContributionPercent(newPercent)

    setIsUpdating(true)
    const result = await updateContributionPercent(newPercent)
    setIsUpdating(false)

    if (result.ok) {
      onToast('Auto-contribution updated!', 'success')
    } else {
      onToast(result.error, 'error')
      setContributionPercent(profile.contribution_percent ?? 10)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-[#1e2a3a] bg-[#0e1420]/40 p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Charity Preferences</h3>
        <p className="text-sm text-slate-400">Choose your charity and set contribution amount</p>
      </div>

      {/* Selected Charity Display */}
      {selectedCharity ? (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="flex items-start gap-4">
            <img
              src={selectedCharity.logo_url || 'https://via.placeholder.com/60'}
              alt={selectedCharity.name}
              className="w-14 h-14 rounded-lg object-cover border border-sky-500/30"
            />
            <div className="flex-1">
              <p className="font-medium text-white">{selectedCharity.name}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{selectedCharity.description}</p>
              <div className="mt-2 inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" />
                <span className="text-xs font-medium text-emerald-400">
                  ${(selectedCharity.total_raised_pence / 100).toFixed(2)} raised
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={onChangeCharity}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            Change Charity
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-4 text-center">
          <Heart className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-400 mb-3">No charity selected yet</p>
          <Button
            onClick={onChangeCharity}
            variant="primary"
            size="sm"
            className="w-full"
          >
            Select a Charity
          </Button>
        </div>
      )}

      {/* Auto-Contribution Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">Auto-Contribution %</label>
          <div className="text-base font-semibold text-sky-400">{contributionPercent}%</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleContributionChange(Math.max(0, contributionPercent - 5))}
            disabled={isUpdating || contributionPercent === 0}
            className="p-2 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 h-2 rounded-full bg-[#1e2a3a] overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${contributionPercent}%` }}
            />
          </div>

          <button
            onClick={() => handleContributionChange(Math.min(100, contributionPercent + 5))}
            disabled={isUpdating || contributionPercent === 100}
            className="p-2 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          {contributionPercent > 0
            ? `${contributionPercent}% of your future winnings will be donated to ${selectedCharity?.name || 'your selected charity'}`
            : 'No contribution will be made'}
        </p>
      </div>
    </motion.div>
  )
}
