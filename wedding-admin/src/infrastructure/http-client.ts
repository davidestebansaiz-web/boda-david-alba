import { ApiError } from "./api-error";

interface ApiErrorPayload {
  message?: string;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");

const buildApiUrl = (path: string): string => (apiBaseUrl.length > 0 ? `${apiBaseUrl}${path}` : path);

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Ignore JSON parsing issues and use status fallback.
  }

  return `Request failed with status ${response.status}`;
};

const createRequestHeaders = (headers?: HeadersInit): Headers => {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  return requestHeaders;
};

const request = async <T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PATCH";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<T> => {
  const response = await fetch(buildApiUrl(path), {
    method: options.method,
    headers: createRequestHeaders(options.headers),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const getJson = async <T>(path: string, headers?: HeadersInit): Promise<T> =>
  request<T>(path, { method: "GET", headers });

export const postJson = async <T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> =>
  request<T>(path, { method: "POST", body, headers });

export const patchJson = async <T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> =>
  request<T>(path, { method: "PATCH", body, headers });
