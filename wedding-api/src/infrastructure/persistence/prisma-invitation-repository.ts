import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import type {
  CreateInvitationInput,
  InvitationRepository,
  SaveRsvpByTokenInput,
  UpdateInvitationInput,
} from "../../application/ports/invitation-repository";
import type { Invitation, Invitee, InviteeRsvpResponse, RsvpStatus } from "../../domain/invitation";

const invitationWithRsvp = {
  include: {
    rsvp: true,
    invitees: {
      orderBy: {
        seat: "asc" as const,
      },
    },
  },
} satisfies Prisma.InvitationDefaultArgs;

type InvitationWithRsvp = Prisma.InvitationGetPayload<typeof invitationWithRsvp>;

type PersistedInvitee = InvitationWithRsvp["invitees"][number];

interface InviteeDraft {
  seat: number;
  code: string;
  displayName: string;
}

const buildDefaultInviteeDrafts = (guestName: string, maxGuests: number): InviteeDraft[] => {
  const drafts: InviteeDraft[] = [];

  for (let seat = 1; seat <= maxGuests; seat += 1) {
    drafts.push({
      seat,
      code: `guest-${seat}`,
      displayName: seat === 1 ? guestName : `Acompanante ${seat - 1}`,
    });
  }

  return drafts;
};

const toDomainInvitee = (invitee: PersistedInvitee): Invitee => ({
  id: invitee.code,
  displayName: invitee.displayName,
});

const toInviteeRsvpResponse = (invitee: PersistedInvitee): InviteeRsvpResponse => ({
  inviteeId: invitee.code,
  attending: invitee.attending ?? false,
  note: invitee.message,
});

const normalizeInviteeResponses = (
  invitees: Invitee[],
  responses: InviteeRsvpResponse[],
): InviteeRsvpResponse[] => {
  const responsesById = new Map(responses.map((response) => [response.inviteeId, response]));

  return invitees.map((invitee) => {
    const response = responsesById.get(invitee.id);

    if (!response) {
      return {
        inviteeId: invitee.id,
        attending: false,
        note: null,
      };
    }

    return {
      inviteeId: invitee.id,
      attending: response.attending,
      note: response.note,
    };
  });
};

const calculateAttendingCount = (responses: InviteeRsvpResponse[]): number =>
  responses.reduce((count, response) => count + (response.attending ? 1 : 0), 0);

const deriveStatus = (attendingCount: number): RsvpStatus => (attendingCount > 0 ? "ACCEPTED" : "DECLINED");

const deriveMessage = (responses: InviteeRsvpResponse[]): string | null => {
  const firstNonEmptyMessage = responses.find((response) => response.note !== null && response.note.length > 0);
  return firstNonEmptyMessage?.note ?? null;
};

const hasSubmittedInviteeData = (invitees: PersistedInvitee[]): boolean =>
  invitees.some((invitee) => {
    if (invitee.attending !== null) {
      return true;
    }

    return invitee.message !== null && invitee.message.trim().length > 0;
  });

const getLatestInviteeUpdate = (invitees: PersistedInvitee[], fallback: Date): Date => {
  let latest = fallback;

  for (const invitee of invitees) {
    if (invitee.updatedAt.getTime() > latest.getTime()) {
      latest = invitee.updatedAt;
    }
  }

  return latest;
};

const mapInvitation = (invitation: InvitationWithRsvp): Invitation => {
  const invitees = invitation.invitees.map(toDomainInvitee);
  const inviteeResponses = invitation.invitees.map(toInviteeRsvpResponse);
  const hasSubmission = hasSubmittedInviteeData(invitation.invitees);

  if (!hasSubmission && !invitation.rsvp) {
    return {
      id: invitation.id,
      token: invitation.token,
      guestName: invitation.guestName,
      maxGuests: invitation.maxGuests,
      adminNotes: invitation.adminNotes,
      qrTargetUrl: invitation.qrTargetUrl,
      qrSvg: invitation.qrSvg,
      qrUpdatedAt: invitation.qrUpdatedAt,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      invitees,
      rsvp: null,
    };
  }

  const attendingCount = calculateAttendingCount(inviteeResponses);
  const status: RsvpStatus = hasSubmission ? deriveStatus(attendingCount) : "PENDING";
  const latestInviteeUpdate = getLatestInviteeUpdate(invitation.invitees, invitation.updatedAt);

  return {
    id: invitation.id,
    token: invitation.token,
    guestName: invitation.guestName,
    maxGuests: invitation.maxGuests,
    adminNotes: invitation.adminNotes,
    qrTargetUrl: invitation.qrTargetUrl,
    qrSvg: invitation.qrSvg,
    qrUpdatedAt: invitation.qrUpdatedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    invitees,
    rsvp: {
      status,
      attendingCount: hasSubmission ? attendingCount : null,
      message: hasSubmission ? deriveMessage(inviteeResponses) : null,
      inviteeResponses,
      submittedAt: invitation.rsvp?.submittedAt ?? latestInviteeUpdate,
      updatedAt: invitation.rsvp?.updatedAt ?? latestInviteeUpdate,
    },
  };
};

export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createInvitation(input: CreateInvitationInput): Promise<Invitation> {
    const drafts = buildDefaultInviteeDrafts(input.guestName, input.maxGuests);

    const created = await this.prisma.invitation.create({
      data: {
        token: input.token,
        guestName: input.guestName,
        maxGuests: input.maxGuests,
        adminNotes: input.adminNotes,
        qrTargetUrl: input.qrTargetUrl,
        qrSvg: input.qrSvg,
        qrUpdatedAt: input.qrUpdatedAt,
        invitees: {
          create: drafts.map((draft) => ({
            seat: draft.seat,
            code: draft.code,
            displayName: draft.displayName,
          })),
        },
      },
      ...invitationWithRsvp,
    });

    return mapInvitation(created);
  }

  async listInvitations(): Promise<Invitation[]> {
    const invitations = await this.prisma.invitation.findMany({
      ...invitationWithRsvp,
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations.map(mapInvitation);
  }

  async countAcceptedInvitations(): Promise<number> {
    return this.prisma.rsvp.count({
      where: {
        status: "ACCEPTED",
      },
    });
  }

  async findInvitationById(id: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      ...invitationWithRsvp,
    });

    return invitation ? mapInvitation(invitation) : null;
  }

  async findInvitationByToken(token: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      ...invitationWithRsvp,
    });

    return invitation ? mapInvitation(invitation) : null;
  }

  async updateInvitation(id: string, input: UpdateInvitationInput): Promise<Invitation | null> {
    const existing = await this.prisma.invitation.findUnique({
      where: { id },
      ...invitationWithRsvp,
    });

    if (!existing) {
      return null;
    }

    const nextGuestName = input.guestName ?? existing.guestName;
    const nextMaxGuests = input.maxGuests ?? existing.maxGuests;
    const shouldReshapeInvitees = nextGuestName !== existing.guestName || nextMaxGuests !== existing.maxGuests;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id },
        data: {
          guestName: input.guestName,
          maxGuests: input.maxGuests,
          adminNotes: input.adminNotes,
          qrTargetUrl: input.qrTargetUrl,
          qrSvg: input.qrSvg,
          qrUpdatedAt: input.qrUpdatedAt,
        },
      });

      if (shouldReshapeInvitees) {
        const nextInvitees = buildDefaultInviteeDrafts(nextGuestName, nextMaxGuests);
        const nextCodes = new Set(nextInvitees.map((invitee) => invitee.code));
        const existingByCode = new Map(existing.invitees.map((invitee) => [invitee.code, invitee]));

        for (const invitee of nextInvitees) {
          if (existingByCode.has(invitee.code)) {
            await tx.invitee.update({
              where: {
                invitationId_code: {
                  invitationId: existing.id,
                  code: invitee.code,
                },
              },
              data: {
                seat: invitee.seat,
                displayName: invitee.displayName,
              },
            });
            continue;
          }

          await tx.invitee.create({
            data: {
              invitationId: existing.id,
              seat: invitee.seat,
              code: invitee.code,
              displayName: invitee.displayName,
            },
          });
        }

        await tx.invitee.deleteMany({
          where: {
            invitationId: existing.id,
            code: {
              notIn: [...nextCodes],
            },
          },
        });

        if (existing.rsvp) {
          const reshapedInvitees = await tx.invitee.findMany({
            where: { invitationId: existing.id },
            orderBy: {
              seat: "asc",
            },
          });

          const hasSubmission = hasSubmittedInviteeData(reshapedInvitees);
          const responses = reshapedInvitees.map(toInviteeRsvpResponse);
          const attendingCount = calculateAttendingCount(responses);

          await tx.rsvp.update({
            where: { invitationId: existing.id },
            data: {
              status: hasSubmission ? deriveStatus(attendingCount) : "PENDING",
              attendingCount: hasSubmission ? attendingCount : null,
              message: hasSubmission ? deriveMessage(responses) : null,
            },
          });
        }
      }

      return tx.invitation.findUnique({
        where: { id },
        ...invitationWithRsvp,
      });
    });

    return updated ? mapInvitation(updated) : null;
  }

  async deleteInvitation(id: string): Promise<boolean> {
    const result = await this.prisma.invitation.deleteMany({ where: { id } });
    return result.count > 0;
  }

  async saveRsvpByToken(token: string, input: SaveRsvpByTokenInput): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      ...invitationWithRsvp,
    });

    if (!invitation) {
      return null;
    }

    const invitees = invitation.invitees.map(toDomainInvitee);
    const normalizedResponses = normalizeInviteeResponses(invitees, input.inviteeResponses);
    const attendingCount = calculateAttendingCount(normalizedResponses);

    await this.prisma.$transaction(async (tx) => {
      for (const response of normalizedResponses) {
        await tx.invitee.update({
          where: {
            invitationId_code: {
              invitationId: invitation.id,
              code: response.inviteeId,
            },
          },
          data: {
            attending: response.attending,
            message: response.note,
          },
        });
      }

      await tx.rsvp.upsert({
        where: { invitationId: invitation.id },
        create: {
          invitationId: invitation.id,
          status: deriveStatus(attendingCount),
          attendingCount,
          message: deriveMessage(normalizedResponses),
        },
        update: {
          status: deriveStatus(attendingCount),
          attendingCount,
          message: deriveMessage(normalizedResponses),
        },
      });
    });

    const updated = await this.prisma.invitation.findUnique({
      where: { id: invitation.id },
      ...invitationWithRsvp,
    });

    return updated ? mapInvitation(updated) : null;
  }
}
