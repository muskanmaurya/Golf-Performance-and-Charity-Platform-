'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Trash2, AlertCircle, Check } from 'lucide-react'
import { requestPasswordReset, deleteAccount } from '@/app/actions/settings'
import type { ToastType } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import type { Profile } from '@/lib/types'

interface SecuritySectionProps {
  profile: Profile
  authEmail: string
  onToast: (message: string, type?: ToastType) => void
}

export default function SecuritySection({ profile, authEmail, onToast }: SecuritySectionProps) {
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)

  const handlePasswordReset = async () => {
    setIsResettingPassword(true)
    const result = await requestPasswordReset(authEmail)
    setIsResettingPassword(false)

    if (result.ok) {
      setPasswordResetSent(true)
      onToast('Password reset email sent! Check your inbox.', 'success')
      setTimeout(() => setPasswordResetSent(false), 3000)
    } else {
      onToast(result.error, 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      onToast('Please enter your password', 'error')
      return
    }

    setIsDeleting(true)
    const result = await deleteAccount(deletePassword)
    setIsDeleting(false)

    if (result.ok) {
      onToast('Account deleted successfully. Redirecting...', 'success')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      onToast(result.error, 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-[#1e2a3a] bg-[#0e1420]/40 p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Security & Privacy</h3>
        <p className="text-sm text-slate-400">Manage your account security</p>
      </div>

      {/* Password Reset */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="w-5 h-5 text-sky-400" />
          <div>
            <p className="text-sm font-medium text-white">Password</p>
            <p className="text-xs text-slate-400">Secure your account with a strong password</p>
          </div>
        </div>

        {passwordResetSent ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-emerald-300">Email sent! Check your inbox for reset link.</span>
          </div>
        ) : (
          <Button
            onClick={handlePasswordReset}
            loading={isResettingPassword}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isResettingPassword ? 'Sending Email...' : 'Reset Password'}
          </Button>
        )}
      </div>

      {/* Delete Account Section */}
      <div className="pt-6 border-t border-[#1e2a3a]">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Delete Account</p>
              <p className="text-xs text-red-200/70 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              size="sm"
              className="w-full gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-3"
            >
              <p className="text-sm text-red-300 font-medium">Are you absolutely sure?</p>
              <p className="text-xs text-red-200/70">
                This will permanently delete your account, all your scores, draw entries, and cannot be recovered.
              </p>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1420] border border-red-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  disabled={isDeleting}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
