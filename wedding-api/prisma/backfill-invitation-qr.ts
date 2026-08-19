import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

import { composeDefaultInvitationQrTargetUrl } from "../src/application/use-cases/invitation-qr-url";
import { loadInvitationQrConfigFromEnv } from "../src/config/invitation-qr-config";

const prisma = new PrismaClient();

const run = async (): Promise<void> => {
  const config = loadInvitationQrConfigFromEnv();
  const invitations = await prisma.invitation.findMany({
    select: {
      id: true,
      token: true,
      qrTargetUrl: true,
      qrSvg: true,
    },
  });

  const now = new Date();

  for (const invitation of invitations) {
    const normalizedDefaultTarget = composeDefaultInvitationQrTargetUrl(
      config.weddingWebsiteBaseUrl,
      invitation.token,
    );

    const nextTarget =
      invitation.qrTargetUrl.startsWith("https://example.invalid/") || invitation.qrTargetUrl.trim().length === 0
        ? normalizedDefaultTarget
        : invitation.qrTargetUrl;

    const nextSvg = await QRCode.toString(nextTarget, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
    });

    if (nextTarget === invitation.qrTargetUrl && nextSvg === invitation.qrSvg) {
      continue;
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        qrTargetUrl: nextTarget,
        qrSvg: nextSvg,
        qrUpdatedAt: now,
      },
    });
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
