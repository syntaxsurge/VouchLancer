import { NextResponse } from 'next/server'

import { and, eq } from 'drizzle-orm'

import { hashPassword, signToken } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { users, teams, teamMembers } from '@/lib/db/schema/core'

/* -------------------------------------------------------------------------- */
/*                               C O N S T A N T S                            */
/* -------------------------------------------------------------------------- */

const ONE_DAY_MS = 86_400_000
const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const COOKIE_SECURE = BASE_URL.startsWith('https://')

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const { email, name, role }: { email?: string; name?: string; role?: string } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    /* --------------------------- Find or create user ------------------------- */
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    let user = existing[0]

    if (!user) {
      const passwordHash = await hashPassword(crypto.randomUUID() + email)
      const [created] = await db
        .insert(users)
        .values({
          name: name || email.split('@')[0],
          email,
          passwordHash,
          role: role || 'candidate',
        })
        .returning()
      user = created
    }

    /* --------------------------- Personal team setup ------------------------- */
    const personalTeamName = `${email}'s Team`

    let [personalTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.creatorUserId, user.id))
      .limit(1)

    if (!personalTeam) {
      ;[personalTeam] = await db
        .insert(teams)
        .values({ name: personalTeamName, creatorUserId: user.id })
        .returning()
    }

    const membership = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, personalTeam.id), eq(teamMembers.userId, user.id)))
      .limit(1)

    if (membership.length === 0) {
      await db.insert(teamMembers).values({
        userId: user.id,
        teamId: personalTeam.id,
        role: 'owner',
      })
    }

    /* --------------------------- Issue session cookie ------------------------ */
    const expires = new Date(Date.now() + ONE_DAY_MS)
    const token = await signToken({
      user: { id: user.id },
      expires: expires.toISOString(),
    })

    const res = NextResponse.json({ success: true })
    res.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      expires,
      path: '/',
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
