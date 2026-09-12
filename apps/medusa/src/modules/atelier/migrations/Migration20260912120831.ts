import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912120831 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "commission" add column if not exists "access_token" text null, add column if not exists "cart_id" text null, add column if not exists "order_id" text null, add column if not exists "paid_at" timestamptz null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_access_token" ON "commission" ("access_token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_cart_id" ON "commission" ("cart_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_commission_access_token";`);
    this.addSql(`drop index if exists "IDX_commission_cart_id";`);
    this.addSql(`alter table if exists "commission" drop column if exists "access_token", drop column if exists "cart_id", drop column if exists "order_id", drop column if exists "paid_at";`);
  }

}
