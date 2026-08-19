export interface Invitee {
  id: string;
  displayName: string;
}

export interface InviteeResponse {
  inviteeId: string;
  attending: boolean;
  note: string | null;
}

export interface PublicInvitationContext {
  invitationId: string;
  token: string;
  guestName: string;
  maxGuests: number;
  invitees: Invitee[];
  currentResponses: InviteeResponse[];
}

export interface PublicRsvpSubmissionResult {
  invitationId: string;
  token: string;
  rsvp: {
    status: string;
    attendingCount: number | null;
    message: string | null;
    inviteeResponses: InviteeResponse[];
    submittedAt: string;
    updatedAt: string;
  };
}

export interface SubmitInviteeResponseInput {
  inviteeId: string;
  attending: boolean;
  note: string | null;
}
