'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { updateCharityPreference } from '@/app/actions/settings'
import type { ToastType } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import type { Charity } from '@/lib/types'

interface ChangeCharityModalProps {
  isOpen: boolean
  onClose: () => void
  charities: Charity[]
  selectedCharityId: string | null | undefined
  onToast: (message: string, type?: ToastType) => void
}

export default function ChangeCharityModal({
  isOpen,
  onClose,
  charities,
  selectedCharityId,
  onToast,
}: ChangeCharityModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSelectCharity = async (charityId: string) => {
    setIsUpdating(true)
    const result = await updateCharityPreference(charityId)
    setIsUpdating(false)

    if (result.ok) {
      onToast('Charity updated successfully!', 'success')
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 500)
    } else {
      onToast(result.error, 'error')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1e2a3a] bg-[#0a0f1a] shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[#1e2a3a] bg-[#0a0f1a]/95 backdrop-blur">
                <div>
                  <h2 className="text-lg font-semibold text-white">Select a Charity</h2>
                  <p className="text-sm text-slate-400 mt-1">Choose where your contributions will go</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Charities Grid */}
              <div className="p-6 space-y-3">
                {charities.filter((c) => c.is_active).map((charity) => {
                  const isSelected = charity.id === selectedCharityId
                  return (
                    <motion.button
                      key={charity.id}
                      onClick={() => handleSelectCharity(charity.id)}
                      disabled={isUpdating}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      className={`
                        w-full rounded-xl p-4 border transition-all duration-200 text-left
                        flex items-start gap-4
                        ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                            : 'border-[#1e2a3a] hover:border-sky-500/50 hover:bg-sky-500/5'
                        }
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <img
                        src={charity.logo_url || 'https://via.placeholder.com/60'}
                        alt={charity.name}
                        className="w-16 h-16 rounded-lg object-cover border border-[#1e2a3a]"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-white">{charity.name}</h3>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
                            >
                              <Heart className="w-3 h-3 text-white" fill="white" />
                            </motion.div>
                          )}
                        </div>

                        <p className="text-sm text-slate-400 line-clamp-2 mb-2">{charity.description}</p>

                        <div className="flex items-center gap-2 text-xs">
                          <Heart className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" />
                          <span className="text-emerald-400 font-medium">
                            ${(charity.total_raised_pence / 100).toFixed(2)} raised
                          </span>
                          {charity.website_url && (
                            <>
                              <span className="text-slate-600">•</span>
                              <a
                                href={charity.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sky-400 hover:text-sky-300"
                              >
                                Visit Website
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex gap-3 p-6 border-t border-[#1e2a3a] bg-[#0a0f1a]/95 backdrop-blur">
                <Button onClick={onClose} variant="ghost" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
