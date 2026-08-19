import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors";

export const registerHttpErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    const maybeValidationError = error as Error & { validation?: unknown };

    if (maybeValidationError.validation) {
      reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: error.message,
      });
      return;
    }

    if (error instanceof ValidationError) {
      reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: error.message,
        details: error.details,
      });
      return;
    }

    if (error instanceof NotFoundError) {
      reply.status(404).send({
        code: "NOT_FOUND",
        message: error.message,
      });
      return;
    }

    if (error instanceof UnauthorizedError) {
      reply.status(401).send({
        code: "UNAUTHORIZED",
        message: error.message,
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  });
};
