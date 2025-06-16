import { cookies } from 'next/headers'

import { desc, and, eq, isNull } from 'drizzle-orm'

import { requireAuth } from '@/lib/auth/guards'
import { verifyToken } from '@/lib/auth/session'

import { db } from '../drizzle'
import { activityLogs, teamMembers, teams, users, type Team, type User } from '../schema'

/* -------------------------------------------------------------------------- */
/*                              U S E R  H E L P E R                          */
/* -------------------------------------------------------------------------- */

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  if (!sessionCookie?.value) return null

  const sessionData = await verifyToken(sessionCookie.value)
  if (!sessionData?.user || typeof sessionData.user.id !== 'number') return null
  if (new Date(sessionData.expires) < new Date()) return null

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1)

  return user ?? null
}

/* -------------------------------------------------------------------------- */
/*                              S T R I P E                                   */
/* -------------------------------------------------------------------------- */

export async function getTeamByStripeCustomerId(customerId: string): Promise<Team | null> {
  const [row] = await db.select().from(teams).where(eq(teams.stripeCustomerId, customerId)).limit(1)
  return row ?? null
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null
    stripeProductId: string | null
    planName: string | null
    subscriptionStatus: string
  },
) {
  await db
    .update(teams)
    .set({ ...subscriptionData, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
}

/* -------------------------------------------------------------------------- */
/*                              U S E R  &  T E A M                           */
/* -------------------------------------------------------------------------- */

export async function getUserWithTeam(userId: number) {
  const [row] = await db
    .select({ user: users, teamId: teamMembers.teamId })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1)
  return row
}

export async function getActivityLogs() {
  const user = await requireAuth()

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10)
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: { id: true, name: true, email: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  return result?.teamMembers[0]?.team ?? null
}
