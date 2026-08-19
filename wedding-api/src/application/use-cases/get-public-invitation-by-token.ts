import type { PublicInvitationContext } from "../../domain/invitation";
import { NotFoundError } from "../../shared/errors";
import type { InvitationRepository } from "../ports/invitation-repository";

export class GetPublicInvitationByTokenUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(token: string): Promise<PublicInvitationContext> {
    const invitation = await this.repository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    return {
      invitationId: invitation.id,
      token: invitation.token,
      guestName: invitation.guestName,
      maxGuests: invitation.maxGuests,
      invitees: invitation.invitees,
      currentResponses:
        invitation.rsvp?.inviteeResponses ??
        invitation.invitees.map((invitee) => ({
          inviteeId: invitee.id,
          attending: false,
          note: null,
        })),
    };
  }
}
