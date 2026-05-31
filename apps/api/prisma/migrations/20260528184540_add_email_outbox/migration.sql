-- CreateEnum
CREATE TYPE "EmailNotificationType" AS ENUM ('ORDER_CONFIRMATION', 'TICKET_TRANSFER_SENT', 'TICKET_TRANSFER_RECEIVED');

-- CreateEnum
CREATE TYPE "EmailNotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "EmailNotification" (
    "id" TEXT NOT NULL,
    "type" "EmailNotificationType" NOT NULL,
    "status" "EmailNotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailNotification_status_createdAt_idx" ON "EmailNotification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailNotification_toEmail_idx" ON "EmailNotification"("toEmail");

-- CreateIndex
CREATE INDEX "EmailNotification_type_idx" ON "EmailNotification"("type");
