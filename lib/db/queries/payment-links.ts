import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/lib/db/drizzle'
import { paymentLinks, type NewPaymentLink, type PaymentLink } from '@/lib/db/schema/payment-links'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

function buildUrl(userId: number, slug: string) {
  const root = BASE.replace(/\/+$/, '')
  return `${root}/payment/${userId}/${slug}`
}

type PaymentLinkWithUrl = PaymentLink & { url: string }

export async function listPaymentLinks(userId: number): Promise<PaymentLinkWithUrl[]> {
  const rows = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.userId, userId))
    .orderBy(desc(paymentLinks.createdAt))
  return rows.map((r) => ({ ...r, url: buildUrl(r.userId, r.slug) }))
}

export async function getPaymentLink(
  userId: number,
  slug: string,
): Promise<PaymentLinkWithUrl | null> {
  const [row] = await db
    .select()
    .from(paymentLinks)
    .where(and(eq(paymentLinks.userId, userId), eq(paymentLinks.slug, slug)))
    .limit(1)
  return row ? { ...row, url: buildUrl(row.userId, row.slug) } : null
}

export async function createPaymentLink(
  user: { id: number },
  payload: {
    name: string
    description?: string
    amount?: number
  },
): Promise<PaymentLinkWithUrl> {
  const slug = crypto.randomUUID()
  const newLink: NewPaymentLink = {
    userId: user.id,
    name: payload.name,
    description: payload.description,
    amount: payload.amount !== undefined ? Number(payload.amount).toFixed(2) : undefined,
    currency: 'USD',
    slug,
    earnings: '0',
    transactions: 0,
    status: 'Active',
  }
  const [inserted] = await db.insert(paymentLinks).values(newLink).returning()
  return { ...inserted, url: buildUrl(user.id, slug) }
}

export async function updatePaymentLink(
  userId: number,
  slug: string,
  patch: Partial<Omit<PaymentLink, 'id' | 'userId' | 'slug' | 'createdAt'>> & {
    amount?: number | string | null
  },
): Promise<PaymentLinkWithUrl | null> {
  const { currency: _currency, amount: amt, ...rest } = patch

  /* Normalise incoming amount (number → fixed-string) */
  const normalisedAmount =
    typeof amt === 'number'
      ? Number(amt).toFixed(2)
      : typeof amt === 'string' && amt.trim() !== ''
        ? amt
        : undefined

  const sanitized: Partial<Omit<PaymentLink, 'id' | 'userId' | 'slug' | 'createdAt'>> & {
    amount?: string | null
  } = { ...rest }

  if (normalisedAmount !== undefined) {
    sanitized.amount = normalisedAmount
  }

  const [updated] = await db
    .update(paymentLinks)
    .set({ ...sanitized, updatedAt: new Date() })
    .where(and(eq(paymentLinks.userId, userId), eq(paymentLinks.slug, slug)))
    .returning()

  return updated ? { ...updated, url: buildUrl(updated.userId, updated.slug) } : null
}

export async function deletePaymentLink(userId: number, slug: string) {
  const res = await db
    .delete(paymentLinks)
    .where(and(eq(paymentLinks.userId, userId), eq(paymentLinks.slug, slug)))
    .returning({ slug: paymentLinks.slug })
  return res.length > 0
}

export async function recordPayment(
  slug: string,
  amount: number,
): Promise<PaymentLinkWithUrl | null> {
  const [updated] = await db
    .update(paymentLinks)
    .set({
      earnings: sql`${paymentLinks.earnings} + ${amount}`,
      transactions: sql`${paymentLinks.transactions} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(paymentLinks.slug, slug))
    .returning()
  return updated ? { ...updated, url: buildUrl(updated.userId, updated.slug) } : null
}
