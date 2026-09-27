-- AlterTable
ALTER TABLE "payment_gateways" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
