import type {
  Invitee,
  InviteeRsvpResponse,
  Invitation,
  PublicInvitationContext,
  PublicRsvpSubmissionResult,
  Rsvp,
} from "../../domain/invitation";

interface RsvpResponse {
  status: string;
  attendingCount: number | null;
  message: string | null;
  inviteeResponses: InviteeRsvpResponseResponse[];
  submittedAt: string;
  updatedAt: string;
}

interface InviteeResponse {
  id: string;
  displayName: string;
}

interface InviteeRsvpResponseResponse {
  inviteeId: string;
  attending: boolean;
  note: string | null;
}

export interface AdminInvitationResponse {
  id: string;
  token: string;
  guestName: string;
  maxGuests: number;
  adminNotes: string | null;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  rsvp: RsvpResponse | null;
}

export interface PublicInvitationContextResponse {
  invitationId: string;
  token: string;
  guestName: string;
  maxGuests: number;
  invitees: InviteeResponse[];
  currentResponses: InviteeRsvpResponseResponse[];
}

export interface PublicRsvpSubmissionResultResponse {
  invitationId: string;
  token: string;
  rsvp: RsvpResponse;
}

const toRsvpResponse = (rsvp: Rsvp | null): RsvpResponse | null => {
  if (!rsvp) {
    return null;
  }

  return {
    status: rsvp.status,
    attendingCount: rsvp.attendingCount,
    message: rsvp.message,
    inviteeResponses: rsvp.inviteeResponses.map(toInviteeRsvpResponse),
    submittedAt: rsvp.submittedAt.toISOString(),
    updatedAt: rsvp.updatedAt.toISOString(),
  };
};

const toInvitee = (invitee: Invitee): InviteeResponse => ({
  id: invitee.id,
  displayName: invitee.displayName,
});

const toInviteeRsvpResponse = (inviteeResponse: InviteeRsvpResponse): InviteeRsvpResponseResponse => ({
  inviteeId: inviteeResponse.inviteeId,
  attending: inviteeResponse.attending,
  note: inviteeResponse.note,
});

export const toAdminInvitationResponse = (invitation: Invitation): AdminInvitationResponse => ({
  id: invitation.id,
  token: invitation.token,
  guestName: invitation.guestName,
  maxGuests: invitation.maxGuests,
  adminNotes: invitation.adminNotes,
  qrTargetUrl: invitation.qrTargetUrl,
  qrSvg: invitation.qrSvg,
  qrUpdatedAt: invitation.qrUpdatedAt.toISOString(),
  createdAt: invitation.createdAt.toISOString(),
  updatedAt: invitation.updatedAt.toISOString(),
  rsvp: toRsvpResponse(invitation.rsvp),
});

export const toPublicInvitationContextResponse = (
  context: PublicInvitationContext,
): PublicInvitationContextResponse => ({
  invitationId: context.invitationId,
  token: context.token,
  guestName: context.guestName,
  maxGuests: context.maxGuests,
  invitees: context.invitees.map(toInvitee),
  currentResponses: context.currentResponses.map(toInviteeRsvpResponse),
});

export const toPublicRsvpSubmissionResultResponse = (
  result: PublicRsvpSubmissionResult,
): PublicRsvpSubmissionResultResponse => ({
  invitationId: result.invitationId,
  token: result.token,
  rsvp: {
    status: result.rsvp.status,
    attendingCount: result.rsvp.attendingCount,
    message: result.rsvp.message,
    inviteeResponses: result.rsvp.inviteeResponses.map(toInviteeRsvpResponse),
    submittedAt: result.rsvp.submittedAt.toISOString(),
    updatedAt: result.rsvp.updatedAt.toISOString(),
  },
});
