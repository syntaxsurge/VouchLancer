import { NextResponse } from 'next/server'

import { recordPayment } from '@/lib/db/queries/payment-links'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params

  const body = await req.json()
  const amount = Number(body?.amount)

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const link = await recordPayment(slug, amount)
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  return NextResponse.json({ link }, { status: 201 })
}
