ALTER TABLE "payment_links" ALTER COLUMN "amount" SET DATA TYPE numeric(18, 2);--> statement-breakpoint
ALTER TABLE "payment_links" ALTER COLUMN "currency" SET DATA TYPE varchar(3);--> statement-breakpoint
ALTER TABLE "payment_links" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "payment_links" ALTER COLUMN "earnings" SET DATA TYPE numeric(20, 2);