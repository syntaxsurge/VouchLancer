import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Pass‑through edge middleware – all auth is handled client‑side by Civic.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/|_next/|static/|favicon.ico).*)'],
}
