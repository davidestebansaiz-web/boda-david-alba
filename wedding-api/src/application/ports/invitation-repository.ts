import type { Invitation, InviteeRsvpResponse } from "../../domain/invitation";

export interface CreateInvitationInput {
  token: string;
  guestName: string;
  maxGuests: number;
  adminNotes: string | null;
  qrTargetUrl: string;
  qrSvg: string;
  qrUpdatedAt: Date;
}

export interface UpdateInvitationInput {
  guestName?: string;
  maxGuests?: number;
  adminNotes?: string | null;
  qrTargetUrl?: string;
  qrSvg?: string;
  qrUpdatedAt?: Date;
}

export interface SaveRsvpByTokenInput {
  inviteeResponses: InviteeRsvpResponse[];
}

export interface InvitationRepository {
  createInvitation(input: CreateInvitationInput): Promise<Invitation>;
  listInvitations(): Promise<Invitation[]>;
  countAcceptedInvitations(): Promise<number>;
  findInvitationById(id: string): Promise<Invitation | null>;
  findInvitationByToken(token: string): Promise<Invitation | null>;
  updateInvitation(id: string, input: UpdateInvitationInput): Promise<Invitation | null>;
  deleteInvitation(id: string): Promise<boolean>;
  saveRsvpByToken(token: string, input: SaveRsvpByTokenInput): Promise<Invitation | null>;
}
