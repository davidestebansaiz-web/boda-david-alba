import type { Invitation } from "../../domain/invitation";
import { createOpaqueToken } from "../../shared/token";
import type { QrCodeGenerator } from "../ports/qr-code-generator";
import type { InvitationRepository } from "../ports/invitation-repository";
import { composeDefaultInvitationQrTargetUrl } from "./invitation-qr-url";
import {
  assertValidAdminNotes,
  assertValidGuestName,
  assertValidMaxGuests,
  assertValidQrTargetUrl,
  assertValidToken,
} from "./invitation-validation";

export interface CreateAdminInvitationInput {
  token?: string;
  guestName: string;
  maxGuests: number;
  adminNotes?: string | null;
  qrTargetUrl?: string;
}

export interface CreateAdminInvitationDependencies {
  repository: InvitationRepository;
  qrCodeGenerator: QrCodeGenerator;
  weddingWebsiteBaseUrl: string;
}

export class CreateAdminInvitationUseCase {
  constructor(private readonly deps: CreateAdminInvitationDependencies) {}

  async execute(input: CreateAdminInvitationInput): Promise<Invitation> {
    assertValidGuestName(input.guestName);
    assertValidMaxGuests(input.maxGuests);

    const token = input.token?.trim() || createOpaqueToken();
    assertValidToken(token);

    const adminNotes = input.adminNotes ?? null;
    assertValidAdminNotes(adminNotes);

    const qrTargetUrl =
      input.qrTargetUrl === undefined
        ? composeDefaultInvitationQrTargetUrl(this.deps.weddingWebsiteBaseUrl, token)
        : assertValidQrTargetUrl(input.qrTargetUrl);

    const qrSvg = await this.deps.qrCodeGenerator.generateSvg(qrTargetUrl);
    const qrUpdatedAt = new Date();

    return this.deps.repository.createInvitation({
      token,
      guestName: input.guestName.trim(),
      maxGuests: input.maxGuests,
      adminNotes,
      qrTargetUrl,
      qrSvg,
      qrUpdatedAt,
    });
  }
}
