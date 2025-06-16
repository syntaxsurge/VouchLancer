import { NextResponse } from 'next/server'

import { sql, eq } from 'drizzle-orm'

import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db/drizzle'
import { invitations } from '@/lib/db/schema/core'
import { issuers, IssuerStatus } from '@/lib/db/schema/issuer'

export async function GET() {
  const user = await requireAuth()

  /* Invitations addressed to this user’s email that are still pending */
  const [{ count: invitationsCount }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(invitations)
    .where(eq(invitations.email, user.email))

  /* Issuer requests addressed to this user (placeholder – adjust as needed) */
  const issuerRequestsCount = 0

  /* Pending issuer applications (admin only) */
  const [{ count: pendingIssuers }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(issuers)
    .where(eq(issuers.status, IssuerStatus.PENDING))

  return NextResponse.json({
    invitations: Number(invitationsCount),
    issuerRequests: issuerRequestsCount,
    adminPendingIssuers: Number(pendingIssuers),
  })
}
