import fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { dirname } from "node:path";

import type { InvitationRepository } from "./application/ports/invitation-repository";
import { AuthenticateAdminUseCase } from "./application/use-cases/authenticate-admin";
import { CreateAdminInvitationUseCase } from "./application/use-cases/create-admin-invitation";
import { DeleteAdminInvitationUseCase } from "./application/use-cases/delete-admin-invitation";
import { GetAdminInvitationByIdUseCase } from "./application/use-cases/get-admin-invitation-by-id";
import { GetPublicInvitationByTokenUseCase } from "./application/use-cases/get-public-invitation-by-token";
import { ListAdminInvitationsUseCase } from "./application/use-cases/list-admin-invitations";
import { SubmitPublicRsvpByTokenUseCase } from "./application/use-cases/submit-public-rsvp-by-token";
import { UpdateAdminInvitationUseCase } from "./application/use-cases/update-admin-invitation";
import { loadAdminAuthConfigFromEnv } from "./config/auth-config";
import { loadInvitationQrConfigFromEnv } from "./config/invitation-qr-config";
import { loadAndValidateOpenApi } from "./infrastructure/openapi/load-openapi";
import { prisma } from "./infrastructure/persistence/prisma-client";
import { PrismaInvitationRepository } from "./infrastructure/persistence/prisma-invitation-repository";
import { QrCodeSvgGenerator } from "./infrastructure/qr/qrcode-generator";
import { createAdminAuthGuard } from "./interfaces/http/auth-guard";
import { registerHttpErrorHandler } from "./interfaces/http/error-handler";
import { createOperationHandlers } from "./interfaces/http/operation-handlers";
import { registerRoutesFromContract } from "./interfaces/http/register-routes-from-contract";
import { createJwtAccessToken, verifyJwtAccessToken } from "./shared/jwt";

export interface BuildAppOptions {
  openapiPath: string;
  repository?: InvitationRepository;
}

export const buildApp = async (options: BuildAppOptions): Promise<FastifyInstance> => {
  const contract = await loadAndValidateOpenApi(options.openapiPath);
  const authConfig = loadAdminAuthConfigFromEnv();
  const invitationQrConfig = loadInvitationQrConfigFromEnv();

  const app = fastify({
    logger: true,
  });

  await app.register(swagger, {
    mode: "static",
    specification: {
      path: options.openapiPath,
      baseDir: dirname(options.openapiPath),
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  const repository = options.repository ?? new PrismaInvitationRepository(prisma);
  const qrCodeGenerator = new QrCodeSvgGenerator();
  const authenticateAdmin = new AuthenticateAdminUseCase(
    {
      username: authConfig.username,
      password: authConfig.password,
    },
    {
      expiresInSeconds: authConfig.jwtExpiresInSeconds,
      issueToken: (subject: string): string =>
        createJwtAccessToken(subject, authConfig.jwtSecret, authConfig.jwtExpiresInSeconds),
    },
  );

  const adminAuthGuard = createAdminAuthGuard({
    verifyAccessToken: (token: string): void => {
      verifyJwtAccessToken(token, authConfig.jwtSecret);
    },
  });

  const handlers = createOperationHandlers({
    authenticateAdmin,
    createAdminInvitation: new CreateAdminInvitationUseCase({
      repository,
      qrCodeGenerator,
      weddingWebsiteBaseUrl: invitationQrConfig.weddingWebsiteBaseUrl,
    }),
    listAdminInvitations: new ListAdminInvitationsUseCase(repository),
    getAdminInvitationById: new GetAdminInvitationByIdUseCase(repository),
    updateAdminInvitation: new UpdateAdminInvitationUseCase({
      repository,
      qrCodeGenerator,
    }),
    deleteAdminInvitation: new DeleteAdminInvitationUseCase(repository),
    getPublicInvitationByToken: new GetPublicInvitationByTokenUseCase(repository),
    submitPublicRsvpByToken: new SubmitPublicRsvpByTokenUseCase(repository),
  });

  registerRoutesFromContract(app, contract, handlers, {
    securedOperationPreHandler: adminAuthGuard,
  });
  registerHttpErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
};
