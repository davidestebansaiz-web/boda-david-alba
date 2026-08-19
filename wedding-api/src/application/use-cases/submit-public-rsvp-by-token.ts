import type { InviteeRsvpResponse, PublicRsvpSubmissionResult } from "../../domain/invitation";
import { NotFoundError, ValidationError } from "../../shared/errors";
import type { InvitationRepository } from "../ports/invitation-repository";
import { assertValidRsvpMessage } from "./invitation-validation";

export interface SubmitPublicRsvpInviteeInput {
  inviteeId: unknown;
  attending: unknown;
  note?: unknown;
}

export interface SubmitPublicRsvpByTokenInput {
  invitees: SubmitPublicRsvpInviteeInput[];
}

export class SubmitPublicRsvpByTokenUseCase {
  constructor(private readonly repository: InvitationRepository) {}

  async execute(token: string, input: SubmitPublicRsvpByTokenInput): Promise<PublicRsvpSubmissionResult> {
    const invitation = await this.repository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundError("Invitation not found");
    }

    if (!Array.isArray(input.invitees) || input.invitees.length === 0) {
      throw new ValidationError("invitees must be a non-empty array");
    }

    if (input.invitees.length !== invitation.invitees.length) {
      throw new ValidationError("invitees length must match invitation invitee count");
    }

    const inviteesById = new Map(invitation.invitees.map((invitee) => [invitee.id, invitee]));
    const seenInviteeIds = new Set<string>();
    const parsedResponses: InviteeRsvpResponse[] = [];

    for (const invitee of input.invitees) {
      if (typeof invitee.inviteeId !== "string" || invitee.inviteeId.trim().length === 0) {
        throw new ValidationError("inviteeId is required for each invitee response");
      }

      if (seenInviteeIds.has(invitee.inviteeId)) {
        throw new ValidationError("inviteeId values must be unique");
      }

      if (!inviteesById.has(invitee.inviteeId)) {
        throw new ValidationError(`Unknown inviteeId: ${invitee.inviteeId}`);
      }

      if (typeof invitee.attending !== "boolean") {
        throw new ValidationError("attending must be boolean for each invitee response");
      }

      if (invitee.note !== undefined && invitee.note !== null && typeof invitee.note !== "string") {
        throw new ValidationError("note must be a string when provided");
      }

      const note = typeof invitee.note === "string" ? invitee.note.trim() : null;
      assertValidRsvpMessage(note);

      seenInviteeIds.add(invitee.inviteeId);
      parsedResponses.push({
        inviteeId: invitee.inviteeId,
        attending: invitee.attending,
        note,
      });
    }

    const parsedById = new Map(parsedResponses.map((response) => [response.inviteeId, response]));

    const orderedResponses = invitation.invitees.map((invitee) => {
      const response = parsedById.get(invitee.id);

      if (!response) {
        throw new ValidationError(`Missing invitee response for inviteeId: ${invitee.id}`);
      }

      return response;
    });

    const persisted = await this.repository.saveRsvpByToken(token, {
      inviteeResponses: orderedResponses,
    });

    if (!persisted?.rsvp) {
      throw new NotFoundError("Invitation not found");
    }

    return {
      invitationId: persisted.id,
      token: persisted.token,
      rsvp: persisted.rsvp,
    };
  }
}
