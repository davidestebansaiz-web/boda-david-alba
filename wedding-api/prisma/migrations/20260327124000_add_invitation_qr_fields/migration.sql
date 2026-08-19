-- AlterTable
ALTER TABLE "Invitation"
ADD COLUMN "qrTargetUrl" TEXT,
ADD COLUMN "qrSvg" TEXT,
ADD COLUMN "qrUpdatedAt" TIMESTAMP(3);

-- Backfill placeholders for pre-existing invitations.
-- Environment-specific backfill is completed by prisma/backfill-invitation-qr.ts.
UPDATE "Invitation"
SET
  "qrTargetUrl" = 'https://example.invalid/' || "token",
  "qrSvg" = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="black"/></svg>',
  "qrUpdatedAt" = CURRENT_TIMESTAMP
WHERE "qrTargetUrl" IS NULL;

-- Enforce required QR columns for all invitations.
ALTER TABLE "Invitation"
ALTER COLUMN "qrTargetUrl" SET NOT NULL,
ALTER COLUMN "qrSvg" SET NOT NULL,
ALTER COLUMN "qrUpdatedAt" SET NOT NULL,
ALTER COLUMN "qrUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;
