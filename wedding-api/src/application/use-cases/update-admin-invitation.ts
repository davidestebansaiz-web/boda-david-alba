import type { Invitation } from "../../domain/invitation";
import { NotFoundError } from "../../shared/errors";
import type { QrCodeGenerator } from "../ports/qr-code-generator";
import type { InvitationRepository, UpdateInvitationInput } from "../ports/invitation-repository";
import {
  assertValidAdminNotes,
  assertValidGuestName,
  assertValidMaxGuests,
  assertValidQrTargetUrl,
} from "./invitation-validation";

export interface UpdateAdminInvitationInput extends UpdateInvitationInput {
  regenerateQr?: boolean;
}

export interface UpdateAdminInvitationDependencies {
  repository: InvitationRepository;
  qrCodeGenerator: QrCodeGenerator;
}

export class UpdateAdminInvitationUseCase {
  constructor(private readonly deps: UpdateAdminInvitationDependencies) {}

  async execute(invitationId: string, input: UpdateAdminInvitationInput): Promise<Invitation> {
    const existing = await this.deps.repository.findInvitationById(invitationId);

    if (!existing) {
      throw new NotFoundError("Invitation not found");
    }

    const updateInput: UpdateInvitationInput = {};

    if (input.guestName !== undefined) {
      assertValidGuestName(input.guestName);
      updateInput.guestName = input.guestName.trim();
    }

    if (input.maxGuests !== undefined) {
      assertValidMaxGuests(input.maxGuests);
      updateInput.maxGuests = input.maxGuests;
    }

    if (input.adminNotes !== undefined) {
      assertValidAdminNotes(input.adminNotes);
      updateInput.adminNotes = input.adminNotes;
    }

    let nextQrTargetUrl = existing.qrTargetUrl;

    if (input.qrTargetUrl !== undefined) {
      nextQrTargetUrl = assertValidQrTargetUrl(input.qrTargetUrl);
      updateInput.qrTargetUrl = nextQrTargetUrl;
    }

    const shouldRegenerateQr = input.regenerateQr === true || input.qrTargetUrl !== undefined;

    if (shouldRegenerateQr) {
      updateInput.qrSvg = await this.deps.qrCodeGenerator.generateSvg(nextQrTargetUrl);
      updateInput.qrUpdatedAt = new Date();
    }

    const invitation = await this.deps.repository.updateInvitation(invitationId, updateInput);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    return invitation;
  }
}
