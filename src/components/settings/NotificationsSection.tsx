'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Send } from 'lucide-react'
import { updateNotificationPreferences } from '@/app/actions/settings'
import type { ToastType } from '@/components/ui/Toast'
import type { Profile } from '@/lib/types'

interface NotificationsSectionProps {
  profile: Profile
  onToast: (message: string, type?: ToastType) => void
}

export default function NotificationsSection({ profile, onToast }: NotificationsSectionProps) {
  const [drawEmails, setDrawEmails] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const savedDraws = window.localStorage.getItem('demo_draw_notifications')
    const savedWeekly = window.localStorage.getItem('demo_weekly_reports')

    if (savedDraws !== null) setDrawEmails(savedDraws === 'true')
    if (savedWeekly !== null) setWeeklyReports(savedWeekly === 'true')
  }, [])

  const handleToggle = async (type: 'draws' | 'reports', value: boolean) => {
    if (type === 'draws') {
      setDrawEmails(value)
    } else {
      setWeeklyReports(value)
    }

    setIsSaving(true)
    const result = await updateNotificationPreferences(type === 'draws' ? value : drawEmails, type === 'reports' ? value : weeklyReports)
    setIsSaving(false)

    if (result.ok) {
      window.localStorage.setItem('demo_draw_notifications', String(type === 'draws' ? value : drawEmails))
      window.localStorage.setItem('demo_weekly_reports', String(type === 'reports' ? value : weeklyReports))
      onToast('Notification preferences updated!', 'success')
    } else {
      onToast(result.error, 'error')
      // Revert on error
      if (type === 'draws') setDrawEmails(!value)
      else setWeeklyReports(!value)
    }
  }

  const sendDemoEmail = async (kind: 'draw' | 'weekly') => {
    onToast(`Sending demo ${kind === 'draw' ? 'prize draw' : 'weekly impact'} email...`, 'info')
    await new Promise((resolve) => setTimeout(resolve, 600))
    onToast(`Demo email sent to ${profile.email || 'your inbox'}.`, 'success')
  }

  const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex items-center h-6 w-11 rounded-full
        transition-colors duration-200
        ${checked ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white
          transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-[#1e2a3a] bg-[#0e1420]/40 p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Notifications</h3>
        <p className="text-sm text-slate-400">Choose what emails you'd like to receive</p>
      </div>

      <div className="space-y-4">
        {/* Prize Draw Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#1e2a3a] hover:border-[#2a3a4a] transition-colors">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Prize Draw Notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                Get notified when a new prize draw is launched
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendDemoEmail('draw')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 text-xs"
            >
              <Send className="w-3.5 h-3.5" /> Demo
            </button>
            <Toggle
              checked={drawEmails}
              onChange={() => handleToggle('draws', !drawEmails)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Weekly Impact Reports */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#1e2a3a] hover:border-[#2a3a4a] transition-colors">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Weekly Impact Reports</p>
              <p className="text-xs text-slate-400 mt-1">
                Receive weekly updates on your charity contributions and impact
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendDemoEmail('weekly')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs"
            >
              <Send className="w-3.5 h-3.5" /> Demo
            </button>
            <Toggle
              checked={weeklyReports}
              onChange={() => handleToggle('reports', !weeklyReports)}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 px-4">
        You can adjust these preferences anytime. We'll never spam you or share your email with third parties.
      </p>
    </motion.div>
  )
}
