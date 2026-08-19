import type { preHandlerAsyncHookHandler } from "fastify";

import { UnauthorizedError } from "../../shared/errors";

interface AdminAuthGuardDependencies {
  verifyAccessToken: (token: string) => void;
}

const parseAuthorizationHeader = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Missing bearer token");
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());

  if (!match || !match[1]) {
    throw new UnauthorizedError("Invalid bearer token");
  }

  return match[1];
};

export const createAdminAuthGuard = (
  deps: AdminAuthGuardDependencies,
): preHandlerAsyncHookHandler => {
  return async (request) => {
    const token = parseAuthorizationHeader(request.headers.authorization);
    deps.verifyAccessToken(token);
  };
};
