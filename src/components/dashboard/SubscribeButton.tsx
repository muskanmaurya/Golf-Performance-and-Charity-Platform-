'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface SubscribeButtonProps {
  userId: string
  priceId: string
  label?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
}

export default function SubscribeButton({ userId, priceId, label = 'Subscribe Now', className = '', variant = 'secondary' }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setError('')

    if (!priceId) {
      setError('Stripe price ID is not configured.')
      return
    }

    setLoading(true)
    const query = new URLSearchParams({ priceId, userId }).toString()
    window.location.href = `/api/checkout?${query}`
  }

  return (
    <div className={className}>
      <Button type="button" variant={variant} size="sm" onClick={handleSubscribe} loading={loading} disabled={!priceId}>
        {label}
      </Button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
