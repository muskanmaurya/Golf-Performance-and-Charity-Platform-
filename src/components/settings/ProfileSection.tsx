'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Upload, Camera, Check, X } from 'lucide-react'
import { profileUpdateSchema, type ProfileUpdate } from '@/lib/validators/settings'
import { updateProfile, uploadAvatar } from '@/app/actions/settings'
import type { ToastType } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Profile } from '@/lib/types'

interface ProfileSectionProps {
  profile: Profile
  authEmail: string
  onToast: (message: string, type?: ToastType) => void
}

export default function ProfileSection({ profile, authEmail, onToast }: ProfileSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: profile.full_name || '',
      displayName: profile.display_name || '',
    },
  })

  const onSubmit = async (data: ProfileUpdate) => {
    const result = await updateProfile(data.fullName, undefined, undefined, data.displayName)
    if (result.ok) {
      onToast('Profile updated successfully!', 'success')
    } else {
      onToast(result.error, 'error')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadAvatar(formData)
    setIsUploading(false)

    if (result.ok) {
      setAvatarPreview(null)
      setAvatarFailed(false)
      onToast('Avatar uploaded successfully!', 'success')
      // Refresh page to show new avatar
      setTimeout(() => window.location.reload(), 1000)
    } else {
      setAvatarPreview(null)
      onToast(result.error, 'error')
    }
  }

  const initial = (profile.display_name || profile.full_name || authEmail || 'U').trim().charAt(0).toUpperCase()
  const avatarSrc = avatarPreview || profile.avatar_url || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#1e2a3a] bg-[#0e1420]/40 p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Profile Information</h3>
        <p className="text-sm text-slate-400">Update your account details and avatar</p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-end gap-6">
        <div className="relative group">
          {!avatarSrc || avatarFailed ? (
            <div className="w-24 h-24 rounded-2xl border-2 border-sky-500/30 bg-linear-to-br from-sky-500/20 to-emerald-500/20 text-white font-bold text-2xl flex items-center justify-center">
              {initial}
            </div>
          ) : (
            <img
              src={avatarSrc}
              alt="Avatar"
              onError={() => setAvatarFailed(true)}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/30 group-hover:border-sky-500/60 transition-colors"
            />
          )}
          <label
            htmlFor="avatar-input"
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-6 h-6 text-white" />
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isUploading}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-slate-300 mb-2">Avatar</p>
          <p className="text-xs text-slate-500 mb-3">JPG, PNG, WebP. Max 5MB</p>
          <label
            htmlFor="avatar-input"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 cursor-pointer transition-colors"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Change Avatar
              </>
            )}
          </label>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <Input
          label="Display Name (Optional)"
          type="text"
          placeholder="How you'll appear to others"
          {...register('displayName')}
          error={errors.displayName?.message}
          hint="Leave blank to use your full name"
        />

        <Input
          label="Email Address"
          type="email"
          value={authEmail}
          readOnly
          disabled
          className="bg-slate-800/60 border-slate-600/60 text-slate-300 cursor-not-allowed"
          hint="Email is managed through your Supabase account and cannot be changed here."
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
