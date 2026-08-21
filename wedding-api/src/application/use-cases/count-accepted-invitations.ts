import type { InvitationRepository } from "../ports/invitation-repository";

export class CountAcceptedInvitationsUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(): Promise<number> {
    return this.repository.countAcceptedInvitations();
  }
}
