'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import ProfileSection from '@/components/settings/ProfileSection'
import SubscriptionSection from '@/components/settings/SubscriptionSection'
import CharityPreferenceSection from '@/components/settings/CharityPreferenceSection'
import SecuritySection from '@/components/settings/SecuritySection'
import NotificationsSection from '@/components/settings/NotificationsSection'
import ChangeCharityModal from '@/components/settings/ChangeCharityModal'
import type { Profile, Subscription, Charity } from '@/lib/types'
import type { ToastType } from '@/components/ui/Toast'

interface SettingsPageClientProps {
  profile: Profile
  authEmail: string
  selectedCharity: Charity | null
  charities: Charity[]
  subscription: Subscription | null
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
}

export default function SettingsPageClient({
  profile,
  authEmail,
  selectedCharity,
  charities,
  subscription,
  stripePriceIdMonthly,
  stripePriceIdYearly,
}: SettingsPageClientProps) {
  const { toasts, addToast, removeToast } = useToast()
  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false)
  const notify = (message: string, type: ToastType = 'info') => addToast(message, type)

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0f1a] via-[#0e1420] to-[#0a0f1a]">
      {/* Header */}
      <div className="border-b border-[#1e2a3a] bg-[#0a0f1a]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage your account and preferences</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6">
          {/* Profile Information */}
          <ProfileSection profile={profile} authEmail={authEmail} onToast={notify} />

          {/* Subscription Management */}
          <SubscriptionSection
            profile={profile}
            subscription={subscription}
            stripePriceIdMonthly={stripePriceIdMonthly}
            stripePriceIdYearly={stripePriceIdYearly}
          />

          {/* Charity Preferences */}
          <CharityPreferenceSection
            profile={profile}
            charities={charities}
            selectedCharity={selectedCharity}
            onChangeCharity={() => setIsCharityModalOpen(true)}
            onToast={notify}
          />

          {/* Notifications */}
          <NotificationsSection profile={profile} onToast={notify} />

          {/* Security & Privacy */}
          <SecuritySection profile={profile} authEmail={authEmail} onToast={notify} />
        </div>
      </div>

      {/* Modals */}
      <ChangeCharityModal
        isOpen={isCharityModalOpen}
        onClose={() => setIsCharityModalOpen(false)}
        charities={charities}
        selectedCharityId={profile.preferred_charity_id}
        onToast={notify}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
