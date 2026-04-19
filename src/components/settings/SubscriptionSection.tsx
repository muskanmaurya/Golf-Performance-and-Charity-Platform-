'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ExternalLink, Zap } from 'lucide-react'
import { getCustomerPortalUrl } from '@/app/actions/settings'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import type { Profile, Subscription } from '@/lib/types'

interface SubscriptionSectionProps {
  profile: Profile
  subscription?: Subscription | null
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
}

export default function SubscriptionSection({
  profile,
  subscription,
  stripePriceIdMonthly,
  stripePriceIdYearly,
}: SubscriptionSectionProps) {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const isActive = profile.subscription_status === 'active'

  const handleManageSubscription = async () => {
    setIsLoading(true)
    const result = await getCustomerPortalUrl()
    setIsLoading(false)

    if (result.ok && result.url) {
      window.location.href = result.url
    } else {
      addToast(result.error, 'error')
    }
  }

  const handleUpgrade = (priceId: string, planName: string) => {
    const query = new URLSearchParams({
      priceId,
      userId: profile.id,
    }).toString()
    window.location.href = `/api/checkout?${query}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-[#1e2a3a] bg-[#0e1420]/40 p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Subscription Management</h3>
        <p className="text-sm text-slate-400">View and manage your subscription</p>
      </div>

      {isActive ? (
        <>
          {/* Active Subscription Display */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Current Status</p>
                <p className="text-base font-semibold text-emerald-400 mt-1">Active</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {subscription && (
              <>
                <div className="pt-4 border-t border-emerald-500/20 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Plan:</span>
                    <span className="text-sm font-medium text-slate-200">
                      {subscription.plan_name || 'Premium'}
                    </span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Renews:</span>
                      <span className="text-sm font-medium text-slate-200">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Amount:</span>
                    <span className="text-sm font-medium text-slate-200">
                      ${(subscription.amount_pence / 100).toFixed(2)}/month
                    </span>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleManageSubscription}
              loading={isLoading}
              variant="secondary"
              size="sm"
              className="w-full gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Manage Subscription
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            Click "Manage Subscription" to view your billing history, update payment method, or cancel your subscription.
          </p>
        </>
      ) : (
        <>
          {/* Inactive - Show Upgrade CTA */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3 mb-4">
              <Zap className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">No Active Subscription</p>
                <p className="text-xs text-amber-200/70 mt-1">
                  Upgrade to unlock all features and start tracking your golf scores with charity contributions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleUpgrade(stripePriceIdMonthly, 'Monthly')}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Monthly - $5
              </Button>
              <Button
                onClick={() => handleUpgrade(stripePriceIdYearly, 'Yearly')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Yearly - Discounted
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
