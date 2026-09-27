-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'SUPPORT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'PHONE_VERIFICATION');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ServiceAvailability" AS ENUM ('AVAILABLE', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "ServiceCatalogStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ServiceVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "BusinessServiceStatus" AS ENUM ('SETUP', 'ACTIVE', 'PAUSED', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('BUSINESS_SERVICE_STATUS_CHANGED', 'BUSINESS_SERVICE_ASSIGNED', 'BUSINESS_SERVICE_REMOVED', 'BUSINESS_STATUS_CHANGED', 'USER_ROLE_CHANGED', 'ADMIN_LOGIN_CHECKED', 'SERVICE_CATALOG_CREATED', 'SERVICE_CATALOG_UPDATED', 'SERVICE_CATALOG_DELETED', 'BUSINESS_MEMBER_ADDED', 'BUSINESS_MEMBER_REMOVED', 'BUSINESS_OWNERSHIP_TRANSFERRED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "email" VARCHAR(254),
    "name" VARCHAR(120),
    "system_role" "SystemRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'LOGIN',
    "code_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "last_seen_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(11),
    "category" VARCHAR(100),
    "status" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "archived_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_members" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "BusinessMemberRole" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "business_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_definitions" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "short_name" VARCHAR(80) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "app_href" VARCHAR(255),
    "marketing_href" VARCHAR(255) NOT NULL,
    "availability" "ServiceAvailability" NOT NULL,
    "status" "ServiceCatalogStatus" NOT NULL,
    "visibility" "ServiceVisibility" NOT NULL,
    "accent" VARCHAR(40) NOT NULL,
    "icon_key" VARCHAR(80) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_services" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "status" "BusinessServiceStatus" NOT NULL DEFAULT 'SETUP',
    "setup_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "business_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "business_id" UUID,
    "action" "AuditAction" NOT NULL,
    "target_type" VARCHAR(80) NOT NULL,
    "target_id" VARCHAR(100),
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otp_challenges_phone_expires_at_idx" ON "otp_challenges"("phone", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "businesses_status_idx" ON "businesses"("status");

-- CreateIndex
CREATE INDEX "business_members_user_id_idx" ON "business_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_members_business_id_user_id_key" ON "business_members"("business_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_definitions_slug_key" ON "service_definitions"("slug");

-- CreateIndex
CREATE INDEX "service_definitions_status_visibility_sort_order_idx" ON "service_definitions"("status", "visibility", "sort_order");

-- CreateIndex
CREATE INDEX "business_services_service_id_status_idx" ON "business_services"("service_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "business_services_business_id_service_id_key" ON "business_services"("business_id", "service_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_business_id_created_at_idx" ON "audit_logs"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_services" ADD CONSTRAINT "business_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
