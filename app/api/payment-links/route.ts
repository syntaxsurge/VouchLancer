import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import { createPaymentLink, listPaymentLinks } from '@/lib/db/queries/payment-links'

export async function GET() {
  const user = await requireAuth()
  const links = await listPaymentLinks(user.id)
  return NextResponse.json({ links })
}

export async function POST(req: Request) {
  const user = await requireAuth()
  const body = await req.json()
  if (!body?.name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  const link = await createPaymentLink(user, {
    name: body.name,
    description: body.description,
    amount: body.amount ? Number(body.amount) : undefined,
  })
  return NextResponse.json({ link }, { status: 201 })
}
