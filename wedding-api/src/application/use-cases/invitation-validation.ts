import { ValidationError } from "../../shared/errors";

export const assertValidGuestName = (guestName: string): void => {
  if (guestName.trim().length === 0) {
    throw new ValidationError("guestName is required");
  }

  if (guestName.length > 200) {
    throw new ValidationError("guestName cannot be longer than 200 characters");
  }
};

export const assertValidMaxGuests = (maxGuests: number): void => {
  if (!Number.isInteger(maxGuests) || maxGuests < 1) {
    throw new ValidationError("maxGuests must be an integer greater than or equal to 1");
  }
};

export const assertValidAdminNotes = (adminNotes: string | null): void => {
  if (adminNotes !== null && adminNotes.length > 1000) {
    throw new ValidationError("adminNotes cannot be longer than 1000 characters");
  }
};

export const assertValidToken = (token: string): void => {
  if (token.trim().length < 12) {
    throw new ValidationError("token must be at least 12 characters");
  }
};

export const assertValidQrTargetUrl = (qrTargetUrl: string): string => {
  const trimmedValue = qrTargetUrl.trim();

  if (trimmedValue.length === 0) {
    throw new ValidationError("qrTargetUrl is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmedValue);
  } catch {
    throw new ValidationError("qrTargetUrl must be a valid absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ValidationError("qrTargetUrl must use http or https");
  }

  return parsed.toString();
};

export const assertValidRsvpMessage = (message: string | null): void => {
  if (message !== null && message.length > 1000) {
    throw new ValidationError("message cannot be longer than 1000 characters");
  }
};
