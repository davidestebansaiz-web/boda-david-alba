import type {
  PublicInvitationContext,
  PublicRsvpSubmissionResult,
  SubmitInviteeResponseInput,
} from "./rsvp-types";

interface ApiErrorPayload {
  message?: string;
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "");

const buildApiUrl = (path: string): string => (apiBaseUrl.length > 0 ? `${apiBaseUrl}${path}` : path);

const readApiErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;

    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Fallback to generic message when error body is not JSON.
  }

  return `Request failed with status ${response.status}`;
};

export const fetchPublicInvitationContext = async (token: string): Promise<PublicInvitationContext> => {
  const response = await fetch(buildApiUrl(`/public/invitations/${encodeURIComponent(token)}`), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  return (await response.json()) as PublicInvitationContext;
};

export const submitPublicRsvp = async (
  token: string,
  invitees: SubmitInviteeResponseInput[],
): Promise<PublicRsvpSubmissionResult> => {
  const response = await fetch(buildApiUrl(`/public/invitations/${encodeURIComponent(token)}/rsvp`), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ invitees }),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  return (await response.json()) as PublicRsvpSubmissionResult;
};
