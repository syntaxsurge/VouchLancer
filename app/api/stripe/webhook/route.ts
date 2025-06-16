import { NextRequest, NextResponse } from 'next/server'

import Stripe from 'stripe'

import { recordPayment } from '@/lib/db/queries/payment-links'
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      /* -------------------------------------------------------------- */
      /*  Subscription lifecycle (existing logic)                      */
      /* -------------------------------------------------------------- */
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      /* -------------------------------------------------------------- */
      /*  One‑time payment completion (payment links)                   */
      /* -------------------------------------------------------------- */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const linkSlug = session.metadata?.linkSlug as string | undefined
        const amountTotal = session.amount_total ?? 0

        if (linkSlug && amountTotal > 0) {
          const amountUsd = amountTotal / 100
          await recordPayment(linkSlug, amountUsd)
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
