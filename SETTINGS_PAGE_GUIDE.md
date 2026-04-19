# Settings Page Implementation Guide

## Overview
A comprehensive Settings page has been created for the Digital Heroes platform at `/dashboard/settings`. This page allows users to manage their profile, subscriptions, charity preferences, security settings, and notification preferences.

## Features Implemented

### 1. Profile Information Section
- **Update Full Name & Display Name**: Users can customize their full name and optional display name
- **Email Display**: Read-only email address linked to Supabase authentication
- **Avatar Upload**: 
  - Upload custom profile avatar (JPG, PNG, WebP)
  - Max file size: 5MB
  - Images are stored in Supabase Storage (`avatars` bucket)
  - Automatic old avatar cleanup on upload

**Related Files:**
- `src/components/settings/ProfileSection.tsx`
- `src/app/actions/settings.ts` → `uploadAvatar()`

### 2. Subscription Management Section
- **Active Subscription Display**:
  - Shows current status badge (Active/Inactive)
  - Displays plan name, renewal date, and amount
  - "Manage Subscription" button opens Stripe Customer Portal
  
- **Inactive State**:
  - Shows upgrade CTA with Monthly/Yearly plan buttons
  - Direct integration with Stripe checkout

**Related Files:**
- `src/components/settings/SubscriptionSection.tsx`
- `src/app/actions/settings.ts` → `getCustomerPortalUrl()`

### 3. Charity Preferences Section
- **Charity Selection**: 
  - Display currently selected charity with logo and details
  - "Change Charity" button opens modal to browse all active charities
  - Shows total raised amount for each charity
  
- **Auto-Contribution Control**:
  - Interactive slider for setting contribution percentage (0-100%)
  - Plus/minus buttons for quick adjustments
  - Real-time preview of contribution amount
  - Changes saved to `contribution_percent` in profiles table

**Related Files:**
- `src/components/settings/CharityPreferenceSection.tsx`
- `src/components/settings/ChangeCharityModal.tsx`
- `src/app/actions/settings.ts` → `updateProfile()`

### 4. Notifications Section
- **Email Notification Toggles**:
  - Prize Draw Notifications
  - Weekly Impact Reports
  
- **Toggle UI**: Smooth animated toggles with visual feedback
- **Preferences Saved**: Server-side validation and persistence

**Related Files:**
- `src/components/settings/NotificationsSection.tsx`
- `src/app/actions/settings.ts` → `updateNotificationPreferences()`

### 5. Security & Privacy Section
- **Password Reset**: 
  - Button to request password reset email
  - Sends secure link to configured email
  - Success confirmation feedback
  
- **Delete Account**: 
  - Danger zone button with confirmation modal
  - Requires password verification
  - Cascading deletion of all user data:
    - Scores from `golf_scores` table
    - Draw entries from `draw_entries` table
    - Profile from `profiles` table
    - Stripe customer (if exists)
  - Auto-logout after deletion

**Related Files:**
- `src/components/settings/SecuritySection.tsx`
- `src/app/actions/settings.ts` → `requestPasswordReset()`, `deleteAccount()`

## Technical Architecture

### Form Handling
- **React Hook Form** + **Zod Validation**: 
  - Schemas in `src/lib/validators/settings.ts`
  - Reusable validation rules
  - Client-side and server-side validation

### Optimistic UI Updates
- **Toast Notifications**: 
  - Success/error/info messages
  - Auto-dismiss after 3 seconds
  - Custom Toast component: `src/components/ui/Toast.tsx`
- **Loading States**: Buttons show loading indicators during async operations
- **Disabled States**: Form submission prevented during processing

### Server Actions (Next.js)
All database mutations use server actions in `src/app/actions/settings.ts`:
- `updateProfile()` - Update name, display_name, charity, contribution %
- `uploadAvatar()` - Handle file upload to Supabase Storage
- `updateNotificationPreferences()` - Toggle email settings
- `requestPasswordReset()` - Trigger Supabase password reset email
- `deleteAccount()` - Cascade delete user and related data
- `getCustomerPortalUrl()` - Create Stripe billing portal session

### Database Columns
Settings page uses these columns from `profiles` table:
- `full_name` - User's full name
- `display_name` (NEW) - Optional display name
- `avatar_url` - Avatar image URL
- `email` - (read-only) from auth
- `subscription_status` - active/inactive/cancelled/past_due
- `stripe_customer_id` - Link to Stripe customer
- `preferred_charity_id` - Foreign key to charities
- `contribution_percent` - Auto-contribution percentage (0-100)

### Styling
- **Theme**: Dark mode with obsidian backgrounds (#0a0f1a, #0e1420)
- **Accent Colors**: Teal/Sky-500, Emerald-500, Amber-500 for CTAs
- **Animations**: Framer Motion for smooth transitions and modals
- **Responsive**: Works on mobile, tablet, and desktop

## Setup Instructions

### 1. Install Dependencies
```bash
npm install react-hook-form @hookform/resolvers zod
```

### 2. Database Migration
Run the migration to add new columns:
```bash
# Option A: Via Supabase Dashboard
# Copy SQL from: supabase/migrations/20260419_add_display_name_and_settings.sql
# Run in SQL Editor

# Option B: Via Supabase CLI
supabase db push
```

### 3. Create Storage Bucket
1. Go to Supabase Dashboard
2. Storage → New Bucket
3. Name: `avatars`
4. Make Public (or set RLS policies)
5. Set max file size to 10MB (settings use 5MB validation)

### 4. Environment Variables
Ensure these are in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_yyy
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `/dashboard/settings` to test the page.

## User Workflows

### Profile Update
1. User navigates to Settings
2. Updates Full Name and/or Display Name
3. Optionally changes avatar
4. Clicks "Save Changes"
5. Gets success toast notification
6. Page revalidates and shows updated data

### Change Charity
1. Click "Change Charity" button
2. Modal opens showing all active charities
3. Select desired charity
4. Charity updates, modal closes
5. Auto-contribution slider appears

### Adjust Contribution
1. Use slider or +/- buttons to set percentage
2. Real-time change persisted to database
3. Success toast shown
4. Changes reflected immediately

### Manage Subscription
**If Active:**
1. Click "Manage Subscription" button
2. Redirects to Stripe Customer Portal
3. Can update card, cancel, or change plan

**If Inactive:**
1. Click "Monthly - $5" or "Yearly - Discounted"
2. Redirects to Stripe Checkout
3. After payment, webhook activates subscription
4. Page shows "Active" status

### Reset Password
1. Click "Reset Password" button
2. Email sent to registered email
3. Success toast confirms
4. User receives email with reset link

### Delete Account
1. Click "Delete Account" (Danger Zone)
2. Confirmation modal appears
3. Enter password to confirm
4. Click "Delete Permanently"
5. All data deleted, user logged out
6. Redirected to home page

## Error Handling

### Network Errors
All server actions catch and return typed error objects:
```typescript
{ ok: false, error: "User-friendly error message" }
```

### Validation Errors
Zod validation provides field-level error messages displayed inline:
```typescript
<Input error={errors.fullName?.message} />
```

### File Upload Errors
- File type validation (must be image)
- File size validation (max 5MB)
- Storage upload errors caught and displayed

### Authentication Errors
- Missing user redirects to login
- Invalid credentials show specific error messages

## Future Enhancements

1. **Notification Settings Storage**:
   - Add `notification_preferences` JSON column to profiles
   - Implement actual email notification system

2. **Two-Factor Authentication**:
   - Add TOTP/SMS 2FA option

3. **Session Management**:
   - Show active sessions
   - Sign out from other devices

4. **Activity Log**:
   - Display recent account activities
   - IP address and device info

5. **Connected Accounts**:
   - Link social media profiles
   - Import data from other platforms

6. **Billing History**:
   - Show past invoices
   - Automatic payment retry management

## Component File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── settings.ts              # Server actions
│   └── dashboard/
│       └── settings/
│           └── page.tsx              # Server page component
│
├── components/
│   ├── ui/
│   │   └── Toast.tsx                # Toast notification component
│   └── settings/
│       ├── SettingsPageClient.tsx   # Main client layout
│       ├── ProfileSection.tsx       # Profile info & avatar
│       ├── SubscriptionSection.tsx  # Subscription display
│       ├── CharityPreferenceSection.tsx  # Charity & contribution
│       ├── NotificationsSection.tsx # Email notifications
│       ├── SecuritySection.tsx      # Password & account deletion
│       └── ChangeCharityModal.tsx   # Charity selection modal
│
└── lib/
    └── validators/
        └── settings.ts              # Zod schemas
```

## Testing Checklist

- [ ] Profile name update works
- [ ] Display name saves correctly
- [ ] Avatar upload works (test with small image)
- [ ] Avatar preview shows before upload
- [ ] Charity selection modal opens
- [ ] Charity can be changed
- [ ] Contribution slider updates in real-time
- [ ] Subscription display shows correct status
- [ ] Stripe portal redirect works (if subscribed)
- [ ] Upgrade buttons work (if not subscribed)
- [ ] Password reset email received
- [ ] Delete account confirmation modal appears
- [ ] Delete account requires password
- [ ] Toast notifications appear/disappear
- [ ] Form validation errors display correctly
- [ ] Mobile responsive layout works

## Support & Troubleshooting

**Avatar not showing?**
- Check Supabase Storage bucket exists and is public
- Verify file upload succeeded (check Network tab)
- Check avatar_url in database

**Stripe redirect not working?**
- Verify STRIPE_PRICE_ID_* env vars are set
- Check NEXT_PUBLIC_SITE_URL is correct (needed for Stripe return)
- Test with test price IDs

**Delete account failing?**
- Ensure password is correct
- Check SERVICE_ROLE_KEY env var is set (needed for admin delete)
- Verify user has no foreign key constraints

**Charity modal not opening?**
- Check charities table has active charities
- Verify charity logo_url is valid (or provide fallback)

