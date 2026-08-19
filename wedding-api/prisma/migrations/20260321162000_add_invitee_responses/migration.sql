ALTER TABLE "Rsvp"
ADD COLUMN "inviteeResponses" JSONB NOT NULL DEFAULT '[]'::jsonb;
