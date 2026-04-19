import { z } from 'zod'

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.').max(100),
  displayName: z.string().max(50, 'Display name cannot exceed 50 characters.').optional().nullable(),
})

export const charityPreferenceSchema = z.object({
  preferredCharityId: z.string().nullable().optional(),
  autoContributionPercent: z.number().min(0).max(100).optional(),
})

export const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
  confirmEmail: z.string().email(),
})

export const notificationPreferenceSchema = z.object({
  drawEmailNotifications: z.boolean(),
  weeklyReports: z.boolean(),
})

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type CharityPreference = z.infer<typeof charityPreferenceSchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>
export type DeleteAccount = z.infer<typeof deleteAccountSchema>
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>
