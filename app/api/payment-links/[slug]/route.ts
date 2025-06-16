import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import {
  getPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
} from '@/lib/db/queries/payment-links'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireAuth()

  const link = await getPaymentLink(user.id, slug)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ link })
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireAuth()

  /* Ignore any currency mutation */
  const body = await req.json()
  const { currency: _currency, ...patch } = body ?? {}

  const link = await updatePaymentLink(user.id, slug, patch)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ link })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireAuth()

  const ok = await deletePaymentLink(user.id, slug)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
