export type RsvpStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface Invitee {
  id: string;
  displayName: string;
}

export interface InviteeRsvpResponse {
  inviteeId: string;
  attending: boolean;
  note: string | null;
}

export interface Rsvp {
  status: RsvpStatus;
  attendingCount: number | null;
  message: string | null;
  inviteeResponses: InviteeRsvpResponse[];
  submittedAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  token: string;
  guestName: string;
  maxGuests: number;
  adminNotes: string | null;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  invitees: Invitee[];
  rsvp: Rsvp | null;
}

export interface PublicInvitationContext {
  invitationId: string;
  token: string;
  guestName: string;
  maxGuests: number;
  invitees: Invitee[];
  currentResponses: InviteeRsvpResponse[];
}

export interface PublicRsvpSubmissionResult {
  invitationId: string;
  token: string;
  rsvp: Rsvp;
}
