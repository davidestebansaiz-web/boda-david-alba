import { NotFoundError } from "../../shared/errors";
import type { InvitationRepository } from "../ports/invitation-repository";

export class DeleteAdminInvitationUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(invitationId: string): Promise<void> {
    const deleted = await this.repository.deleteInvitation(invitationId);

    if (!deleted) {
      throw new NotFoundError("Invitation not found");
    }
  }
}
