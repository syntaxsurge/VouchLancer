import { pgTable, serial, integer, varchar, numeric, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './core'

/* -------------------------------------------------------------------------- */
/*                           P A Y M E N T  L I N K S                         */
/* -------------------------------------------------------------------------- */

export const paymentLinks = pgTable('payment_links', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  /** Display name shown to supporters */
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 18, scale: 2 }),
  /** Always USD for Stripe checkout */
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  earnings: numeric('earnings', { precision: 20, scale: 2 }).notNull().default('0'),
  transactions: integer('transactions').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('Active'),
  /** Unique slug appended to /payment/[userId]/[slug] */
  slug: varchar('slug', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type PaymentLink = typeof paymentLinks.$inferSelect
export type NewPaymentLink = typeof paymentLinks.$inferInsert
