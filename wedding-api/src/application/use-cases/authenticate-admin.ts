import { timingSafeEqual } from "node:crypto";

import { UnauthorizedError } from "../../shared/errors";

export interface AuthenticateAdminInput {
  username: string;
  password: string;
}

export interface AuthenticateAdminCredentials {
  username: string;
  password: string;
}

export interface AdminAccessTokenIssuer {
  issueToken: (subject: string) => string;
  expiresInSeconds: number;
}

export interface AuthenticateAdminResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

const timingSafeStringEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export class AuthenticateAdminUseCase {
  constructor(
    private readonly credentials: AuthenticateAdminCredentials,
    private readonly tokenIssuer: AdminAccessTokenIssuer,
  ) {}

  async execute(input: AuthenticateAdminInput): Promise<AuthenticateAdminResult> {
    const providedUsername = input.username.trim();
    const providedPassword = input.password;

    const hasValidUsername = timingSafeStringEqual(providedUsername, this.credentials.username);
    const hasValidPassword = timingSafeStringEqual(providedPassword, this.credentials.password);

    if (!hasValidUsername || !hasValidPassword) {
      throw new UnauthorizedError("Invalid admin credentials");
    }

    return {
      accessToken: this.tokenIssuer.issueToken(this.credentials.username),
      tokenType: "Bearer",
      expiresIn: this.tokenIssuer.expiresInSeconds,
    };
  }
}
