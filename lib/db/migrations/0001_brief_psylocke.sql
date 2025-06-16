CREATE TABLE "payment_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"amount" numeric(18, 6),
	"currency" varchar(10) DEFAULT 'USDC' NOT NULL,
	"earnings" numeric(20, 6) DEFAULT '0' NOT NULL,
	"transactions" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'Active' NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;