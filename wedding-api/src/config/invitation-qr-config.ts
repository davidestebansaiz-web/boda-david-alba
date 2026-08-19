export interface InvitationQrConfig {
  weddingWebsiteBaseUrl: string;
}

const readRequiredEnvVar = (env: NodeJS.ProcessEnv, key: string): string => {
  const rawValue = env[key];

  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    throw new Error(`Missing required invitation QR configuration: ${key}`);
  }

  return rawValue.trim();
};

const normalizeBaseUrl = (rawValue: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(rawValue);
  } catch {
    throw new Error("WEDDING_WEBSITE_BASE_URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("WEDDING_WEBSITE_BASE_URL must use http or https");
  }

  const trimmedPath = parsed.pathname.replace(/\/+$/, "");
  parsed.pathname = trimmedPath.length > 0 ? trimmedPath : "/";

  const normalized = parsed.toString().replace(/\/+$/, "");
  if (normalized.length === 0) {
    throw new Error("WEDDING_WEBSITE_BASE_URL must be a valid absolute URL");
  }

  return normalized;
};

export const loadInvitationQrConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env,
): InvitationQrConfig => {
  const baseUrl = readRequiredEnvVar(env, "WEDDING_WEBSITE_BASE_URL");

  return {
    weddingWebsiteBaseUrl: normalizeBaseUrl(baseUrl),
  };
};

