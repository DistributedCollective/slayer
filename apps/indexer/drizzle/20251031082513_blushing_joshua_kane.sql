CREATE TABLE "ingestion_sources" (
	"id" serial NOT NULL,
	"key" char(64) PRIMARY KEY NOT NULL,
	"tags" varchar(1024) DEFAULT '[]',
	"mode" varchar(32) DEFAULT 'backfill' NOT NULL,
	"high_water_mark" varchar(32) DEFAULT 'date' NOT NULL,
	"backfill_cursor" varchar(1024),
	"live_cursor" varchar(1024),
	"live_watermark" varchar(256),
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" serial NOT NULL,
	"identifier" char(64) PRIMARY KEY NOT NULL,
	"chain_id" integer NOT NULL,
	"address" char(42) NOT NULL,
	"symbol" varchar(24),
	"name" varchar(256),
	"logo_url" text,
	"is_native" boolean DEFAULT false,
	"decimals" integer DEFAULT 18,
	"ignored" boolean DEFAULT false,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chain_address_pkey" UNIQUE("chain_id","address")
);
