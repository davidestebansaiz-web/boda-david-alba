import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

import { composeDefaultInvitationQrTargetUrl } from "../src/application/use-cases/invitation-qr-url";
import { loadInvitationQrConfigFromEnv } from "../src/config/invitation-qr-config";

const prisma = new PrismaClient();

interface SeedInviteeResponse {
  inviteeId: string;
  attending: boolean | null;
  message: string | null;
}

const baselineInvitations = [
  {
    token: "qr_alba_david_family_001",
    guestName: "Familia Garcia",
    maxGuests: 4,
    adminNotes: "Mesa principal",
    rsvp: {
      status: "ACCEPTED" as const,
      attendingCount: 4,
      message: "Nos hace mucha ilusion acompanaros",
      inviteeResponses: [
        { inviteeId: "guest-1", attending: true, message: "Nos hace mucha ilusion acompanaros" },
        { inviteeId: "guest-2", attending: true, message: null },
        { inviteeId: "guest-3", attending: true, message: null },
        { inviteeId: "guest-4", attending: true, message: null },
      ],
    },
  },
  {
    token: "qr_alba_david_friends_002",
    guestName: "Laura y Mario",
    maxGuests: 2,
    adminNotes: "Amigos universidad",
    rsvp: {
      status: "PENDING" as const,
      attendingCount: null,
      message: null,
      inviteeResponses: [
        { inviteeId: "guest-1", attending: null, message: null },
        { inviteeId: "guest-2", attending: null, message: null },
      ],
    },
  },
  {
    token: "qr_alba_david_colleagues_003",
    guestName: "Equipo Producto",
    maxGuests: 3,
    adminNotes: null,
    rsvp: {
      status: "DECLINED" as const,
      attendingCount: 0,
      message: "Ese fin de semana estamos de viaje",
      inviteeResponses: [
        { inviteeId: "guest-1", attending: false, message: "Ese fin de semana estamos de viaje" },
        { inviteeId: "guest-2", attending: false, message: null },
        { inviteeId: "guest-3", attending: false, message: null },
      ],
    },
  },
];

const buildInvitees = (
  guestName: string,
  maxGuests: number,
  responses: SeedInviteeResponse[],
): Array<{ seat: number; code: string; displayName: string; attending: boolean | null; message: string | null }> => {
  const responsesByCode = new Map(responses.map((response) => [response.inviteeId, response]));

  const invitees: Array<{
    seat: number;
    code: string;
    displayName: string;
    attending: boolean | null;
    message: string | null;
  }> = [];

  for (let seat = 1; seat <= maxGuests; seat += 1) {
    const code = `guest-${seat}`;
    const response = responsesByCode.get(code);

    invitees.push({
      seat,
      code,
      displayName: seat === 1 ? guestName : `Acompanante ${seat - 1}`,
      attending: response?.attending ?? null,
      message: response?.message ?? null,
    });
  }

  return invitees;
};

async function main() {
  const qrConfig = loadInvitationQrConfigFromEnv();

  for (const invitation of baselineInvitations) {
    const qrTargetUrl = composeDefaultInvitationQrTargetUrl(qrConfig.weddingWebsiteBaseUrl, invitation.token);
    const qrSvg = await QRCode.toString(qrTargetUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
    });

    const persisted = await prisma.invitation.upsert({
      where: { token: invitation.token },
      update: {
        guestName: invitation.guestName,
        maxGuests: invitation.maxGuests,
        adminNotes: invitation.adminNotes,
        qrTargetUrl,
        qrSvg,
        qrUpdatedAt: new Date(),
      },
      create: {
        token: invitation.token,
        guestName: invitation.guestName,
        maxGuests: invitation.maxGuests,
        adminNotes: invitation.adminNotes,
        qrTargetUrl,
        qrSvg,
        qrUpdatedAt: new Date(),
      },
    });

    await prisma.invitee.deleteMany({ where: { invitationId: persisted.id } });

    await prisma.invitee.createMany({
      data: buildInvitees(
        invitation.guestName,
        invitation.maxGuests,
        invitation.rsvp.inviteeResponses,
      ).map((invitee) => ({
        invitationId: persisted.id,
        seat: invitee.seat,
        code: invitee.code,
        displayName: invitee.displayName,
        attending: invitee.attending,
        message: invitee.message,
      })),
    });

    await prisma.rsvp.upsert({
      where: { invitationId: persisted.id },
      update: {
        status: invitation.rsvp.status,
        attendingCount: invitation.rsvp.attendingCount,
        message: invitation.rsvp.message,
      },
      create: {
        invitationId: persisted.id,
        status: invitation.rsvp.status,
        attendingCount: invitation.rsvp.attendingCount,
        message: invitation.rsvp.message,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
