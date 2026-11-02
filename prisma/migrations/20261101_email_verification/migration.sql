-- Migration: 20261101_email_verification
-- Neon PostgreSQL Schema Update: User Email Verification & Verification Tokens

-- 1. Create or Update "users" Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- In case users table already existed from earlier schema:
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Create Unique Index on email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- 2. Create "verification_tokens" Table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS "verification_tokens_email_idx" ON "verification_tokens"("email");
CREATE INDEX IF NOT EXISTS "verification_tokens_user_id_idx" ON "verification_tokens"("user_id");

-- Foreign key referencing users(id) with Cascade Delete
ALTER TABLE "verification_tokens" 
    DROP CONSTRAINT IF EXISTS "verification_tokens_user_id_fkey",
    ADD CONSTRAINT "verification_tokens_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- 3. Create or Update "jobs" Table
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Wishlist',
    "application_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "job_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "jobs_user_id_idx" ON "jobs"("user_id");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "jobs_company_idx" ON "jobs"("company");
CREATE INDEX IF NOT EXISTS "jobs_position_idx" ON "jobs"("position");

ALTER TABLE "jobs" 
    DROP CONSTRAINT IF EXISTS "jobs_user_id_fkey",
    ADD CONSTRAINT "jobs_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

