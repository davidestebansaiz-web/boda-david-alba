import type { RouteHandlerMethod } from "fastify";

import { AuthenticateAdminUseCase } from "../../application/use-cases/authenticate-admin";
import { CreateAdminInvitationUseCase } from "../../application/use-cases/create-admin-invitation";
import { DeleteAdminInvitationUseCase } from "../../application/use-cases/delete-admin-invitation";
import { GetAdminInvitationByIdUseCase } from "../../application/use-cases/get-admin-invitation-by-id";
import { GetPublicInvitationByTokenUseCase } from "../../application/use-cases/get-public-invitation-by-token";
import { ListAdminInvitationsUseCase } from "../../application/use-cases/list-admin-invitations";
import { SubmitPublicRsvpByTokenUseCase } from "../../application/use-cases/submit-public-rsvp-by-token";
import { UpdateAdminInvitationUseCase } from "../../application/use-cases/update-admin-invitation";
import { ValidationError } from "../../shared/errors";
import {
  toAdminInvitationResponse,
  toPublicInvitationContextResponse,
  toPublicRsvpSubmissionResultResponse,
} from "./presenters";

export type OperationHandlers = Record<string, RouteHandlerMethod>;

export interface OperationDependencies {
  authenticateAdmin: AuthenticateAdminUseCase;
  createAdminInvitation: CreateAdminInvitationUseCase;
  listAdminInvitations: ListAdminInvitationsUseCase;
  getAdminInvitationById: GetAdminInvitationByIdUseCase;
  updateAdminInvitation: UpdateAdminInvitationUseCase;
  deleteAdminInvitation: DeleteAdminInvitationUseCase;
  getPublicInvitationByToken: GetPublicInvitationByTokenUseCase;
  submitPublicRsvpByToken: SubmitPublicRsvpByTokenUseCase;
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  return value;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number") {
    return undefined;
  }

  return value;
};

const readOptionalString = (body: Record<string, unknown>, key: string): string | undefined => {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${key} must be a string`);
  }

  return value;
};

const readOptionalBoolean = (body: Record<string, unknown>, key: string): boolean | undefined => {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new ValidationError(`${key} must be a boolean`);
  }

  return value;
};

const asArray = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
};

export const createOperationHandlers = (deps: OperationDependencies): OperationHandlers => ({
  adminLogin: async (request, reply) => {
    const body = asRecord(request.body);
    const result = await deps.authenticateAdmin.execute({
      username: asString(body.username) ?? "",
      password: asString(body.password) ?? "",
    });

    reply.status(200).send(result);
  },

  getPublicInvitationByToken: async (request, reply) => {
    const { token } = request.params as { token: string };
    const context = await deps.getPublicInvitationByToken.execute(token);
    reply.status(200).send(toPublicInvitationContextResponse(context));
  },

  submitPublicRsvpByToken: async (request, reply) => {
    const { token } = request.params as { token: string };
    const body = asRecord(request.body);
    const invitees = asArray(body.invitees).map((invitee) => {
      const record = asRecord(invitee);

      return {
        inviteeId: record.inviteeId,
        attending: record.attending,
        note: record.note,
      };
    });

    const result = await deps.submitPublicRsvpByToken.execute(token, {
      invitees,
    });

    reply.status(200).send(toPublicRsvpSubmissionResultResponse(result));
  },

  createAdminInvitation: async (request, reply) => {
    const body = asRecord(request.body);
    const invitation = await deps.createAdminInvitation.execute({
      token: asString(body.token),
      guestName: asString(body.guestName) ?? "",
      maxGuests: asNumber(body.maxGuests) ?? Number.NaN,
      adminNotes: asString(body.adminNotes) ?? null,
      qrTargetUrl: readOptionalString(body, "qrTargetUrl"),
    });

    reply.status(201).send(toAdminInvitationResponse(invitation));
  },

  listAdminInvitations: async (_request, reply) => {
    const invitations = await deps.listAdminInvitations.execute();
    reply.status(200).send(invitations.map(toAdminInvitationResponse));
  },

  getAdminInvitationById: async (request, reply) => {
    const { invitationId } = request.params as { invitationId: string };
    const invitation = await deps.getAdminInvitationById.execute(invitationId);
    reply.status(200).send(toAdminInvitationResponse(invitation));
  },

  updateAdminInvitation: async (request, reply) => {
    const { invitationId } = request.params as { invitationId: string };
    const body = asRecord(request.body);

    const invitation = await deps.updateAdminInvitation.execute(invitationId, {
      guestName: asString(body.guestName),
      maxGuests: asNumber(body.maxGuests),
      adminNotes: body.adminNotes === null ? null : asString(body.adminNotes),
      qrTargetUrl: readOptionalString(body, "qrTargetUrl"),
      regenerateQr: readOptionalBoolean(body, "regenerateQr"),
    });

    reply.status(200).send(toAdminInvitationResponse(invitation));
  },

  deleteAdminInvitation: async (request, reply) => {
    const { invitationId } = request.params as { invitationId: string };
    await deps.deleteAdminInvitation.execute(invitationId);
    reply.status(204).send();
  },
});
