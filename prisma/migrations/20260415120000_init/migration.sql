-- CreateSchema
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");

CREATE TABLE "poker_tables" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blinds_label" TEXT NOT NULL,
    "max_seats" INTEGER NOT NULL,
    "seated_count" INTEGER NOT NULL DEFAULT 0,
    "waiting_count" INTEGER NOT NULL DEFAULT 0,
    "footer_text" TEXT NOT NULL DEFAULT '',
    "logo_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poker_tables_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "poker_tables_location_id_idx" ON "poker_tables"("location_id");

CREATE INDEX "poker_tables_is_active_idx" ON "poker_tables"("is_active");

ALTER TABLE "poker_tables" ADD CONSTRAINT "poker_tables_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
