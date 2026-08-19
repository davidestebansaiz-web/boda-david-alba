import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app";
import { InMemoryInvitationRepository } from "./in-memory-invitation-repository";

const openapiPath = resolve(process.cwd(), "openapi.yaml");

const defaultAdminCredentials = {
  username: "admin",
  password: "super-secret",
};

const setAuthEnv = (): void => {
  process.env.ADMIN_USERNAME = defaultAdminCredentials.username;
  process.env.ADMIN_PASSWORD = defaultAdminCredentials.password;
  process.env.JWT_SECRET = "test-jwt-secret-for-suite";
  process.env.JWT_EXPIRES_IN = "30m";
  process.env.WEDDING_WEBSITE_BASE_URL = "http://albaydavidsecasan.es";
};

const buildTestApp = async (): Promise<FastifyInstance> => {
  const repository = new InMemoryInvitationRepository();
  return buildApp({ openapiPath, repository });
};

const getAdminAccessToken = async (
  app: FastifyInstance,
  credentials: { username: string; password: string } = defaultAdminCredentials,
): Promise<string> => {
  const loginResponse = await app.inject({
    method: "POST",
    url: "/admin/auth/login",
    payload: credentials,
  });

  expect(loginResponse.statusCode).toBe(200);

  const payload = loginResponse.json() as {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };

  expect(payload.tokenType).toBe("Bearer");
  expect(payload.expiresIn).toBeGreaterThan(0);
  expect(payload.accessToken).toBeTypeOf("string");

  return payload.accessToken;
};

const asBearerHeaders = (token: string): Record<string, string> => ({
  authorization: `Bearer ${token}`,
});

describe("wedding-api", () => {
  let app: FastifyInstance | null = null;

  beforeEach(() => {
    setAuthEnv();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it("fails startup when OpenAPI contract is invalid", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "wedding-api-openapi-"));
    const invalidOpenapiPath = join(tempDir, "openapi-invalid.yaml");

    await writeFile(invalidOpenapiPath, "openapi: 3.0.3\ninfo:\n  title: broken\n");

    await expect(
      buildApp({
        openapiPath: invalidOpenapiPath,
        repository: new InMemoryInvitationRepository(),
      }),
    ).rejects.toThrow();
  });

  it("fails startup when auth environment configuration is missing", async () => {
    delete process.env.ADMIN_USERNAME;

    await expect(
      buildApp({
        openapiPath,
        repository: new InMemoryInvitationRepository(),
      }),
    ).rejects.toThrow(/ADMIN_USERNAME/);
  });

  it("fails startup when invitation QR base URL configuration is missing", async () => {
    delete process.env.WEDDING_WEBSITE_BASE_URL;

    await expect(
      buildApp({
        openapiPath,
        repository: new InMemoryInvitationRepository(),
      }),
    ).rejects.toThrow(/WEDDING_WEBSITE_BASE_URL/);
  });

  it("serves Swagger UI from /docs", async () => {
    app = await buildTestApp();
    const response = await app.inject({ method: "GET", url: "/docs" });
    const jsonSpecResponse = await app.inject({ method: "GET", url: "/docs/json" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(jsonSpecResponse.statusCode).toBe(200);

    const openApiSpec = jsonSpecResponse.json() as {
      components?: {
        securitySchemes?: Record<string, unknown>;
        schemas?: {
          AdminInvitation?: {
            properties?: Record<string, unknown>;
          };
        };
      };
      paths?: Record<string, unknown>;
    };

    expect(openApiSpec.components?.securitySchemes).toHaveProperty("BearerAuth");
    expect(openApiSpec.paths).toHaveProperty("/admin/auth/login");
    expect(openApiSpec.components?.schemas?.AdminInvitation?.properties).toHaveProperty("qrTargetUrl");
    expect(openApiSpec.components?.schemas?.AdminInvitation?.properties).toHaveProperty("qrSvg");
    expect(openApiSpec.components?.schemas?.AdminInvitation?.properties).toHaveProperty("qrUpdatedAt");
  });

  it("authenticates admin and rejects invalid credentials", async () => {
    app = await buildTestApp();

    const successfulLogin = await app.inject({
      method: "POST",
      url: "/admin/auth/login",
      payload: defaultAdminCredentials,
    });

    expect(successfulLogin.statusCode).toBe(200);

    const failedLogin = await app.inject({
      method: "POST",
      url: "/admin/auth/login",
      payload: {
        username: defaultAdminCredentials.username,
        password: "wrong-password",
      },
    });

    expect(failedLogin.statusCode).toBe(401);
    expect(failedLogin.json()).toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects admin endpoints without a valid bearer token", async () => {
    app = await buildTestApp();

    const missingToken = await app.inject({
      method: "GET",
      url: "/admin/invitations",
    });

    expect(missingToken.statusCode).toBe(401);

    const invalidToken = await app.inject({
      method: "GET",
      url: "/admin/invitations",
      headers: {
        authorization: "Bearer this-is-not-a-valid-token",
      },
    });

    expect(invalidToken.statusCode).toBe(401);
  });

  it("supports authenticated admin CRUD and public RSVP by token", async () => {
    app = await buildTestApp();
    const accessToken = await getAdminAccessToken(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Invitados QA",
        maxGuests: 3,
        adminNotes: "Sin alergias",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    expect(created.token).toBeTypeOf("string");
    expect(created.adminNotes).toBe("Sin alergias");
    expect(created.qrTargetUrl).toBe(`http://albaydavidsecasan.es/${encodeURIComponent(created.token)}`);
    expect(created.qrSvg).toContain("<svg");
    expect(created.qrUpdatedAt).toBeTypeOf("string");

    const listResponse = await app.inject({
      method: "GET",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const publicLookup = await app.inject({
      method: "GET",
      url: `/public/invitations/${created.token}`,
    });
    expect(publicLookup.statusCode).toBe(200);
    const publicPayload = publicLookup.json();
    expect(publicPayload.adminNotes).toBeUndefined();
    expect(publicPayload.guestName).toBe("Invitados QA");
    expect(publicPayload.invitees).toHaveLength(3);

    const submitRsvp = await app.inject({
      method: "POST",
      url: `/public/invitations/${created.token}/rsvp`,
      payload: {
        invitees: [
          { inviteeId: "guest-1", attending: true, note: "Alli estaremos" },
          { inviteeId: "guest-2", attending: true, note: null },
          { inviteeId: "guest-3", attending: false, note: "Se cae a ultima hora" },
        ],
      },
    });

    expect(submitRsvp.statusCode).toBe(200);
    expect(submitRsvp.json().rsvp.status).toBe("ACCEPTED");
    expect(submitRsvp.json().rsvp.inviteeResponses).toHaveLength(3);

    const getById = await app.inject({
      method: "GET",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
    });

    expect(getById.statusCode).toBe(200);
    expect(getById.json().rsvp.attendingCount).toBe(2);
    expect(getById.json().rsvp.inviteeResponses[2].attending).toBe(false);

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
      payload: {
        maxGuests: 4,
        qrTargetUrl: "https://albaydavidsecasan.es/invitacion-personalizada",
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().maxGuests).toBe(4);
    expect(updateResponse.json().qrTargetUrl).toBe("https://albaydavidsecasan.es/invitacion-personalizada");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
    });

    expect(deleteResponse.statusCode).toBe(204);

    const afterDelete = await app.inject({
      method: "GET",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
    });

    expect(afterDelete.statusCode).toBe(404);
  });

  it("rejects invalid RSVP payload and does not persist changes", async () => {
    app = await buildTestApp();
    const accessToken = await getAdminAccessToken(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Payload Validation",
        maxGuests: 2,
      },
    });

    const created = createResponse.json();

    const invalidRsvp = await app.inject({
      method: "POST",
      url: `/public/invitations/${created.token}/rsvp`,
      payload: {
        invitees: [{ inviteeId: "guest-999", attending: true }],
      },
    });

    expect(invalidRsvp.statusCode).toBe(400);

    const adminGet = await app.inject({
      method: "GET",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
    });

    expect(adminGet.statusCode).toBe(200);
    expect(adminGet.json().rsvp).toBeNull();
  });

  it("rejects RSVP payload when invitee list does not cover all invitees", async () => {
    app = await buildTestApp();
    const accessToken = await getAdminAccessToken(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Partial Payload",
        maxGuests: 3,
      },
    });

    const created = createResponse.json();

    const partialRsvp = await app.inject({
      method: "POST",
      url: `/public/invitations/${created.token}/rsvp`,
      payload: {
        invitees: [
          { inviteeId: "guest-1", attending: true },
          { inviteeId: "guest-2", attending: false },
        ],
      },
    });

    expect(partialRsvp.statusCode).toBe(400);

    const adminGet = await app.inject({
      method: "GET",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
    });

    expect(adminGet.statusCode).toBe(200);
    expect(adminGet.json().rsvp).toBeNull();
  });

  it("returns not-found for unknown tokens", async () => {
    app = await buildTestApp();

    const unknownTokenResponse = await app.inject({
      method: "GET",
      url: "/public/invitations/non-existent-token",
    });

    expect(unknownTokenResponse.statusCode).toBe(404);
  });

  it("regenerates QR explicitly on update without changing target URL", async () => {
    app = await buildTestApp();
    const accessToken = await getAdminAccessToken(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Regenerate QR",
        maxGuests: 2,
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as {
      id: string;
      qrTargetUrl: string;
      qrUpdatedAt: string;
    };

    const regenerateResponse = await app.inject({
      method: "PATCH",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
      payload: {
        regenerateQr: true,
      },
    });

    expect(regenerateResponse.statusCode).toBe(200);
    const updated = regenerateResponse.json() as {
      qrTargetUrl: string;
      qrSvg: string;
      qrUpdatedAt: string;
    };

    expect(updated.qrTargetUrl).toBe(created.qrTargetUrl);
    expect(updated.qrSvg).toContain("<svg");
    expect(new Date(updated.qrUpdatedAt).getTime()).toBeGreaterThanOrEqual(new Date(created.qrUpdatedAt).getTime());
  });

  it("rejects invalid qrTargetUrl on create and update", async () => {
    app = await buildTestApp();
    const accessToken = await getAdminAccessToken(app);

    const invalidCreateResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Invalid QR URL",
        maxGuests: 2,
        qrTargetUrl: "invalid-url",
      },
    });

    expect(invalidCreateResponse.statusCode).toBe(400);

    const createResponse = await app.inject({
      method: "POST",
      url: "/admin/invitations",
      headers: asBearerHeaders(accessToken),
      payload: {
        guestName: "Valid Invitation",
        maxGuests: 2,
      },
    });

    const created = createResponse.json() as { id: string };

    const invalidUpdateResponse = await app.inject({
      method: "PATCH",
      url: `/admin/invitations/${created.id}`,
      headers: asBearerHeaders(accessToken),
      payload: {
        qrTargetUrl: "not-a-url",
      },
    });

    expect(invalidUpdateResponse.statusCode).toBe(400);
  });
});
