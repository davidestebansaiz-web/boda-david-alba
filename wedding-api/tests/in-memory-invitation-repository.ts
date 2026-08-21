import type {
  CreateInvitationInput,
  InvitationRepository,
  SaveRsvpByTokenInput,
  UpdateInvitationInput,
} from "../src/application/ports/invitation-repository";
import type { Invitation, Invitee, InviteeRsvpResponse } from "../src/domain/invitation";

const buildDefaultInvitees = (guestName: string, maxGuests: number): Invitee[] => {
  const invitees: Invitee[] = [];

  for (let seat = 1; seat <= maxGuests; seat += 1) {
    invitees.push({
      id: `guest-${seat}`,
      displayName: seat === 1 ? guestName : `Acompanante ${seat - 1}`,
    });
  }

  return invitees;
};

const normalizeInviteeResponses = (
  invitees: Invitee[],
  responses: InviteeRsvpResponse[],
): InviteeRsvpResponse[] => {
  const byId = new Map(responses.map((response) => [response.inviteeId, response]));

  return invitees.map((invitee) => {
    const response = byId.get(invitee.id);

    return {
      inviteeId: invitee.id,
      attending: response?.attending ?? false,
      note: response?.note ?? null,
    };
  });
};

const calculateAttendingCount = (responses: InviteeRsvpResponse[]): number =>
  responses.reduce((count, response) => count + (response.attending ? 1 : 0), 0);

const cloneInvitation = (invitation: Invitation): Invitation => ({
  ...invitation,
  qrUpdatedAt: new Date(invitation.qrUpdatedAt),
  createdAt: new Date(invitation.createdAt),
  updatedAt: new Date(invitation.updatedAt),
  invitees: invitation.invitees.map((invitee) => ({ ...invitee })),
  rsvp: invitation.rsvp
    ? {
        ...invitation.rsvp,
        inviteeResponses: invitation.rsvp.inviteeResponses.map((response) => ({ ...response })),
        submittedAt: new Date(invitation.rsvp.submittedAt),
        updatedAt: new Date(invitation.rsvp.updatedAt),
      }
    : null,
});

export class InMemoryInvitationRepository implements InvitationRepository {
  private readonly invitations = new Map<string, Invitation>();
  private idCounter = 1;

  constructor(seed: Invitation[] = []) {
    for (const invitation of seed) {
      this.invitations.set(invitation.id, cloneInvitation(invitation));
    }

    if (seed.length > 0) {
      this.idCounter = seed.length + 1;
    }
  }

  async createInvitation(input: CreateInvitationInput): Promise<Invitation> {
    const now = new Date();
    const invitation: Invitation = {
      id: `inv_${this.idCounter++}`,
      token: input.token,
      guestName: input.guestName,
      maxGuests: input.maxGuests,
      adminNotes: input.adminNotes,
      qrTargetUrl: input.qrTargetUrl,
      qrSvg: input.qrSvg,
      qrUpdatedAt: input.qrUpdatedAt,
      createdAt: now,
      updatedAt: now,
      invitees: buildDefaultInvitees(input.guestName, input.maxGuests),
      rsvp: null,
    };

    this.invitations.set(invitation.id, cloneInvitation(invitation));
    return cloneInvitation(invitation);
  }

  async listInvitations(): Promise<Invitation[]> {
    return [...this.invitations.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(cloneInvitation);
  }

  async countAcceptedInvitations(): Promise<number> {
    return [...this.invitations.values()].filter((invitation) => invitation.rsvp?.status === "ACCEPTED").length;
  }

  async findInvitationById(id: string): Promise<Invitation | null> {
    const invitation = this.invitations.get(id);
    return invitation ? cloneInvitation(invitation) : null;
  }

  async findInvitationByToken(token: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.token === token) {
        return cloneInvitation(invitation);
      }
    }

    return null;
  }

  async updateInvitation(id: string, input: UpdateInvitationInput): Promise<Invitation | null> {
    const existing = this.invitations.get(id);

    if (!existing) {
      return null;
    }

    const nextGuestName = input.guestName ?? existing.guestName;
    const nextMaxGuests = input.maxGuests ?? existing.maxGuests;
    const invitees = buildDefaultInvitees(nextGuestName, nextMaxGuests);

    const updated: Invitation = {
      ...existing,
      guestName: nextGuestName,
      maxGuests: nextMaxGuests,
      adminNotes: input.adminNotes === undefined ? existing.adminNotes : input.adminNotes,
      qrTargetUrl: input.qrTargetUrl ?? existing.qrTargetUrl,
      qrSvg: input.qrSvg ?? existing.qrSvg,
      qrUpdatedAt: input.qrUpdatedAt ?? existing.qrUpdatedAt,
      updatedAt: new Date(),
      invitees,
      rsvp: existing.rsvp
        ? (() => {
            const inviteeResponses = normalizeInviteeResponses(invitees, existing.rsvp.inviteeResponses);
            const attendingCount = calculateAttendingCount(inviteeResponses);

            return {
              ...existing.rsvp,
              status: attendingCount > 0 ? "ACCEPTED" : "DECLINED",
              attendingCount,
              message: inviteeResponses.find((response) => response.note)?.note ?? null,
              inviteeResponses,
              updatedAt: new Date(),
            };
          })()
        : null,
    };

    this.invitations.set(id, cloneInvitation(updated));
    return cloneInvitation(updated);
  }

  async deleteInvitation(id: string): Promise<boolean> {
    return this.invitations.delete(id);
  }

  async saveRsvpByToken(token: string, input: SaveRsvpByTokenInput): Promise<Invitation | null> {
    for (const [id, invitation] of this.invitations.entries()) {
      if (invitation.token !== token) {
        continue;
      }

      const now = new Date();
      const inviteeResponses = normalizeInviteeResponses(invitation.invitees, input.inviteeResponses);
      const attendingCount = calculateAttendingCount(inviteeResponses);

      const updated: Invitation = {
        ...invitation,
        updatedAt: now,
        rsvp: {
          status: attendingCount > 0 ? "ACCEPTED" : "DECLINED",
          attendingCount,
          message: inviteeResponses.find((response) => response.note)?.note ?? null,
          inviteeResponses,
          submittedAt: invitation.rsvp?.submittedAt ?? now,
          updatedAt: now,
        },
      };

      this.invitations.set(id, cloneInvitation(updated));
      return cloneInvitation(updated);
    }

    return null;
  }
}
