import { NextRequest, NextResponse } from 'next/server'

import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

import { setSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { users, teams, teamMembers } from '@/lib/db/schema'
import { paymentLinks } from '@/lib/db/schema/payment-links'
import { stripe } from '@/lib/payments/stripe'

/* -------------------------------------------------------------------------- */
/*                               U T I L S                                     */
/* -------------------------------------------------------------------------- */

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

function toCents(usd: number) {
  return Math.round(usd * 100)
}

/* -------------------------------------------------------------------------- */
/*                          S U B S C R I P T I O N  GET                       */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')

  /* This endpoint is used as the Stripe "success_url" for subscription checkouts.
     If there is no session_id we treat it as an invalid access and head back. */
  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    })

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.')
    }

    const customerId = session.customer.id
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

    if (!subscriptionId) {
      throw new Error('No subscription found for this session.')
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    })

    const plan = subscription.items.data[0]?.price
    if (!plan) {
      throw new Error('No plan found for this subscription.')
    }

    const productId = (plan.product as Stripe.Product).id
    if (!productId) {
      throw new Error('No product ID found for this subscription.')
    }

    const userId = session.client_reference_id
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.")
    }

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1)

    if (userRows.length === 0) {
      throw new Error('User not found in database.')
    }

    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, userRows[0].id))
      .limit(1)

    if (userTeam.length === 0) {
      throw new Error('User is not associated with any team.')
    }

    await db
      .update(teams)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName: (plan.product as Stripe.Product).name,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam[0].teamId))

    await setSession(userRows[0])
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Error handling successful checkout:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

/* -------------------------------------------------------------------------- */
/*                   P A Y M E N T ‑ L I N K   P O S T                         */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  /* HTML form posts as application/x-www-form-urlencoded */
  const form = await request.formData()
  const linkSlug = form.get('linkSlug') as string | null

  if (!linkSlug) {
    return NextResponse.json({ error: 'Missing linkSlug' }, { status: 400 })
  }

  /* Look up the payment link by slug */
  const [link] = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.slug, linkSlug))
    .limit(1)

  if (!link) {
    return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
  }

  if (link.status !== 'Active') {
    return NextResponse.json({ error: 'Payment link is not active' }, { status: 400 })
  }

  if (!link.amount) {
    return NextResponse.json(
      { error: 'This payment link does not have a fixed amount configured' },
      { status: 400 },
    )
  }

  /* Construct a one‑time payment Checkout Session */
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: link.name },
            unit_amount: toCents(Number(link.amount)),
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/payment/${link.userId}/${link.slug}?success=1`,
      cancel_url: `${BASE_URL}/payment/${link.userId}/${link.slug}?canceled=1`,
      metadata: {
        linkSlug: link.slug,
        userId: String(link.userId),
      },
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error('Stripe checkout session creation failed:', err)
    return NextResponse.json({ error: 'Unable to create Stripe session' }, { status: 500 })
  }
}
