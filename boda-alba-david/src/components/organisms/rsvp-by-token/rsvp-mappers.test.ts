import { describe, expect, it } from "vitest";

import type { PublicInvitationContext } from "../../../services/rsvp-types";
import { mapContextToInviteeFormValues, mapInviteeFormToPayload } from "./use-rsvp-by-token";

const invitationContext: PublicInvitationContext = {
  invitationId: "invitation-1",
  token: "token-123456789",
  guestName: "Familia Test",
  maxGuests: 2,
  invitees: [
    { id: "guest-1", displayName: "Persona 1" },
    { id: "guest-2", displayName: "Persona 2" },
  ],
  currentResponses: [
    { inviteeId: "guest-1", attending: true, note: "Vegetariano" },
  ],
};

describe("RSVP data mappers", () => {
  it("combines invitees with their existing responses", () => {
    expect(mapContextToInviteeFormValues(invitationContext)).toEqual({
      invitees: [
        {
          inviteeId: "guest-1",
          displayName: "Persona 1",
          attending: true,
          note: "Vegetariano",
        },
        {
          inviteeId: "guest-2",
          displayName: "Persona 2",
          attending: false,
          note: "",
        },
      ],
    });
  });

  it("trims notes and converts empty notes to null", () => {
    expect(mapInviteeFormToPayload({
      invitees: [
        { inviteeId: "guest-1", displayName: "Persona 1", attending: true, note: "  Sí  " },
        { inviteeId: "guest-2", displayName: "Persona 2", attending: false, note: "   " },
      ],
    })).toEqual([
      { inviteeId: "guest-1", attending: true, note: "Sí" },
      { inviteeId: "guest-2", attending: false, note: null },
    ]);
  });
});
