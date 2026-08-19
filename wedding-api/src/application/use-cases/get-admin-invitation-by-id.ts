import type { Invitation } from "../../domain/invitation";
import { NotFoundError } from "../../shared/errors";
import type { InvitationRepository } from "../ports/invitation-repository";

export class GetAdminInvitationByIdUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(invitationId: string): Promise<Invitation> {
    const invitation = await this.repository.findInvitationById(invitationId);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    return invitation;
  }
}
