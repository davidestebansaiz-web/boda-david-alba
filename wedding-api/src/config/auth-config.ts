export interface AdminAuthConfig {
  username: string;
  password: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
}

const readRequiredEnvVar = (env: NodeJS.ProcessEnv, key: string): string => {
  const rawValue = env[key];

  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    throw new Error(`Missing required auth configuration: ${key}`);
  }

  return rawValue.trim();
};

const parseDurationToSeconds = (rawValue: string): number => {
  const trimmedValue = rawValue.trim();

  const numericOnly = /^\d+$/.exec(trimmedValue);
  if (numericOnly) {
    const seconds = Number(trimmedValue);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error("JWT_EXPIRES_IN must be a positive number of seconds");
    }

    return seconds;
  }

  const durationWithUnit = /^(\d+)([smhd])$/i.exec(trimmedValue);
  if (!durationWithUnit) {
    throw new Error("JWT_EXPIRES_IN must use seconds or format like 30m, 12h, 7d");
  }

  const amount = Number(durationWithUnit[1]);
  const unit = durationWithUnit[2]?.toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0 || !unit) {
    throw new Error("JWT_EXPIRES_IN must be a positive duration");
  }

  const unitToSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  const secondsPerUnit = unitToSeconds[unit];
  if (typeof secondsPerUnit !== "number") {
    throw new Error("JWT_EXPIRES_IN must be a positive duration");
  }

  return amount * secondsPerUnit;
};

export const loadAdminAuthConfigFromEnv = (env: NodeJS.ProcessEnv = process.env): AdminAuthConfig => {
  const username = readRequiredEnvVar(env, "ADMIN_USERNAME");
  const password = readRequiredEnvVar(env, "ADMIN_PASSWORD");
  const jwtSecret = readRequiredEnvVar(env, "JWT_SECRET");
  const jwtExpiresInRaw = readRequiredEnvVar(env, "JWT_EXPIRES_IN");

  const jwtExpiresInSeconds = parseDurationToSeconds(jwtExpiresInRaw);

  return {
    username,
    password,
    jwtSecret,
    jwtExpiresInSeconds,
  };
};
