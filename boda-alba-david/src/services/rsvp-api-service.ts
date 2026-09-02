import type {
  PublicInvitationContext,
  PublicRsvpSubmissionResult,
  SubmitInviteeResponseInput,
  AcceptedInvitationsCount,
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

const requestJson = async <ResponseBody>(path: string, init?: RequestInit): Promise<ResponseBody> => {
  const response = await fetch(buildApiUrl(path), init);

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  return (await response.json()) as ResponseBody;
};

export const fetchAcceptedInvitationsCount = (): Promise<AcceptedInvitationsCount> =>
  requestJson("/public/invitations/accepted/count", {
    method: "GET",
  });

export const fetchPublicInvitationContext = (token: string): Promise<PublicInvitationContext> =>
  requestJson(`/public/invitations/${encodeURIComponent(token)}`, {
    method: "GET",
  });

export const submitPublicRsvp = (
  token: string,
  invitees: SubmitInviteeResponseInput[],
): Promise<PublicRsvpSubmissionResult> =>
  requestJson(`/public/invitations/${encodeURIComponent(token)}/rsvp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ invitees }),
  });
