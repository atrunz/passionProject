-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "performerAttributionId" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "performerAttributionId" TEXT;

-- CreateTable
CREATE TABLE "EventPerformer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPerformer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPerformer_eventId_idx" ON "EventPerformer"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPerformer_eventId_slug_key" ON "EventPerformer"("eventId", "slug");

-- CreateIndex
CREATE INDEX "Order_performerAttributionId_idx" ON "Order"("performerAttributionId");

-- CreateIndex
CREATE INDEX "Ticket_performerAttributionId_idx" ON "Ticket"("performerAttributionId");

-- AddForeignKey
ALTER TABLE "EventPerformer" ADD CONSTRAINT "EventPerformer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_performerAttributionId_fkey" FOREIGN KEY ("performerAttributionId") REFERENCES "EventPerformer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_performerAttributionId_fkey" FOREIGN KEY ("performerAttributionId") REFERENCES "EventPerformer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
