import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912095054 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "commission" ("id" text not null, "status" text check ("status" in ('submitted', 'reviewed', 'quoted', 'approved', 'declined', 'in_production', 'shipped')) not null default 'submitted', "name" text not null, "email" text not null, "silhouette" text not null, "silhouette_title" text not null, "fabric" text not null, "note" text null, "measurements" jsonb not null, "measurement_unit" text not null default 'cm', "length_kinds" jsonb null, "references" jsonb null, "estimate_amount" numeric null, "quote_amount" numeric null, "currency_code" text not null default 'chf', "quoted_at" timestamptz null, "internal_note" text null, "raw_estimate_amount" jsonb null, "raw_quote_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "commission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_deleted_at" ON "commission" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_status" ON "commission" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_email" ON "commission" ("email") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "fabric_catalogue" ("id" text not null, "title" text not null, "description" text null, "file_id" text not null, "url" text not null, "mime_type" text not null, "size" integer null, "rank" integer not null default 0, "published" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "fabric_catalogue_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_fabric_catalogue_deleted_at" ON "fabric_catalogue" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_fabric_catalogue_rank" ON "fabric_catalogue" ("rank") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "commission" cascade;`);

    this.addSql(`drop table if exists "fabric_catalogue" cascade;`);
  }

}
