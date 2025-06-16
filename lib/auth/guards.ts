import { redirect } from 'next/navigation'

import { getUser } from '@/lib/db/queries/queries'
import type { Role } from '@/lib/types'

/**
 * Ensures an authenticated session and optional role match.
 * If the session is still being established client‑side (Civic Auth),
 * forward to /auth-required which shows an inline spinner until login completes.
 */
export async function requireAuth(allowedRoles: readonly Role[] = []) {
  const user = await getUser()

  /* ------------------------------------------------------------------ */
  /* Unauthenticated — show civic loading gate                           */
  /* ------------------------------------------------------------------ */
  if (!user) redirect('/auth-required')

  /* ------------------------------------------------------------------ */
  /* Role mismatch — drop user at dashboard root                         */
  /* ------------------------------------------------------------------ */
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as Role)) {
    redirect('/dashboard')
  }

  return user
}
