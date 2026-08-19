-- CreateTable
CREATE TABLE "Invitee" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "attending" BOOLEAN,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_invitationId_seat_key" ON "Invitee"("invitationId", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_invitationId_code_key" ON "Invitee"("invitationId", "code");

-- CreateIndex
CREATE INDEX "Invitee_invitationId_idx" ON "Invitee"("invitationId");

-- AddForeignKey
ALTER TABLE "Invitee" ADD CONSTRAINT "Invitee_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill invitees using invitation seats
INSERT INTO "Invitee" (
  "id",
  "invitationId",
  "seat",
  "code",
  "displayName",
  "attending",
  "message",
  "updatedAt"
)
SELECT
  i."id" || '_seat_' || seat_series::text,
  i."id",
  seat_series,
  'guest-' || seat_series::text,
  CASE
    WHEN seat_series = 1 THEN i."guestName"
    ELSE 'Acompanante ' || (seat_series - 1)::text
  END,
  NULL,
  NULL,
  CURRENT_TIMESTAMP
FROM "Invitation" i
CROSS JOIN LATERAL generate_series(1, i."maxGuests") AS seat_series;

-- Backfill invitee response data from legacy RSVP JSON
UPDATE "Invitee" inv
SET
  "attending" = CASE
    WHEN parsed.response ? 'attending' THEN (parsed.response ->> 'attending')::boolean
    ELSE NULL
  END,
  "message" = NULLIF(BTRIM(parsed.response ->> 'note'), '')
FROM (
  SELECT
    r."invitationId",
    elem AS response
  FROM "Rsvp" r
  CROSS JOIN LATERAL jsonb_array_elements(r."inviteeResponses") AS elem
) parsed
WHERE inv."invitationId" = parsed."invitationId"
  AND inv."code" = parsed.response ->> 'inviteeId';

-- Fallback for legacy rows where RSVP JSON is empty but summary columns exist
UPDATE "Invitee" inv
SET
  "attending" = CASE
    WHEN r."status" = 'ACCEPTED' THEN inv."seat" <= COALESCE(r."attendingCount", 0)
    WHEN r."status" = 'DECLINED' THEN FALSE
    ELSE inv."attending"
  END,
  "message" = CASE
    WHEN inv."seat" = 1 THEN COALESCE(NULLIF(BTRIM(r."message"), ''), inv."message")
    ELSE inv."message"
  END
FROM "Rsvp" r
WHERE inv."invitationId" = r."invitationId"
  AND jsonb_array_length(r."inviteeResponses") = 0
  AND r."status" <> 'PENDING';

-- Recompute RSVP summary from invitees
WITH invitee_stats AS (
  SELECT
    "invitationId",
    BOOL_OR("attending" IS NOT NULL OR "message" IS NOT NULL) AS has_submission,
    COUNT(*) FILTER (WHERE "attending" IS TRUE) AS attending_count,
    MIN("message") FILTER (WHERE "message" IS NOT NULL AND BTRIM("message") <> '') AS first_message
  FROM "Invitee"
  GROUP BY "invitationId"
)
UPDATE "Rsvp" r
SET
  "status" = CASE
    WHEN stats.has_submission IS NOT TRUE THEN 'PENDING'::"RsvpStatus"
    WHEN stats.attending_count > 0 THEN 'ACCEPTED'::"RsvpStatus"
    ELSE 'DECLINED'::"RsvpStatus"
  END,
  "attendingCount" = CASE
    WHEN stats.has_submission IS NOT TRUE THEN NULL
    ELSE stats.attending_count
  END,
  "message" = CASE
    WHEN stats.has_submission IS NOT TRUE THEN NULL
    ELSE stats.first_message
  END
FROM invitee_stats stats
WHERE stats."invitationId" = r."invitationId";

-- Drop legacy JSON column
ALTER TABLE "Rsvp" DROP COLUMN "inviteeResponses";
