CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'field_officer', 'partner');--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"material_type" text NOT NULL,
	"weight" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hotspot_id" integer,
	"is_new_hotspot" boolean DEFAULT false,
	"new_hotspot_name" text,
	"gps_latitude" numeric,
	"gps_longitude" numeric,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"image_url" text,
	"collected_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspots" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"estimated_volume" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'field_officer' NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"organization" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_hotspot_id_hotspots_id_fk" FOREIGN KEY ("hotspot_id") REFERENCES "public"."hotspots"("id") ON DELETE no action ON UPDATE no action;