import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getStripeClient } from '@/lib/stripe'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const stripe = getStripeClient()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is missing.' }, { status: 500 })
  }

  const payload = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          throw new Error('checkout.session.completed event missing metadata.userId.')
        }

        const supabaseAdmin = getSupabaseAdminClient()
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
          })
          .eq('id', userId)

        if (error) {
          throw error
        }

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/scores')
        revalidatePath('/dashboard/draws')
        revalidatePath('/dashboard/charities')
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handling failed.' },
      { status: 500 }
    )
  }
}
