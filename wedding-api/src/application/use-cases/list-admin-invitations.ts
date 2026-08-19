import type { Invitation } from "../../domain/invitation";
import type { InvitationRepository } from "../ports/invitation-repository";

export class ListAdminInvitationsUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(): Promise<Invitation[]> {
    return this.repository.listInvitations();
  }
}
