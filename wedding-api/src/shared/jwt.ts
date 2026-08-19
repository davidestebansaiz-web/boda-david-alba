import { createHmac, timingSafeEqual } from "node:crypto";

import { UnauthorizedError } from "./errors";

interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

const encodeBase64Url = (value: string): string => Buffer.from(value, "utf8").toString("base64url");

const decodeBase64Url = (value: string): string => Buffer.from(value, "base64url").toString("utf8");

const sign = (value: string, secret: string): string =>
  createHmac("sha256", secret).update(value).digest("base64url");

export const createJwtAccessToken = (
  subject: string,
  secret: string,
  expiresInSeconds: number,
  now: Date = new Date(),
): string => {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAt = issuedAt + expiresInSeconds;

  const header: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: JwtPayload = {
    sub: subject,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyJwtAccessToken = (token: string, secret: string, now: Date = new Date()): JwtPayload => {
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    throw new UnauthorizedError("Invalid bearer token");
  }

  const [encodedHeader, encodedPayload, signature] = tokenParts;

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new UnauthorizedError("Invalid bearer token");
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, secret);

  const providedSignatureBuffer = Buffer.from(signature, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    providedSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)
  ) {
    throw new UnauthorizedError("Invalid bearer token");
  }

  let parsedHeader: unknown;
  let parsedPayload: unknown;

  try {
    parsedHeader = JSON.parse(decodeBase64Url(encodedHeader));
    parsedPayload = JSON.parse(decodeBase64Url(encodedPayload));
  } catch {
    throw new UnauthorizedError("Invalid bearer token");
  }

  const header = parsedHeader as Partial<JwtHeader>;

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new UnauthorizedError("Invalid bearer token");
  }

  const payload = parsedPayload as Partial<JwtPayload>;

  if (
    typeof payload.sub !== "string" ||
    payload.sub.trim().length === 0 ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number"
  ) {
    throw new UnauthorizedError("Invalid bearer token");
  }

  const currentTimestamp = Math.floor(now.getTime() / 1000);

  if (payload.exp <= currentTimestamp) {
    throw new UnauthorizedError("Expired bearer token");
  }

  return {
    sub: payload.sub,
    iat: payload.iat,
    exp: payload.exp,
  };
};
