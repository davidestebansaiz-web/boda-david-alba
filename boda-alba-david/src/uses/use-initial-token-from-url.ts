import { useMemo } from "react";

export const extractTokenFromUrl = (url: URL): string | null => {
  const queryToken = url.searchParams.get("token")?.trim();

  if (queryToken) {
    return queryToken;
  }

  const pathMatch = url.pathname.match(/^\/rsvp\/([^/]+)\/?$/);

  if (!pathMatch) {
    return null;
  }

  const decoded = decodeURIComponent(pathMatch[1]).trim();
  return decoded.length > 0 ? decoded : null;
};

export const useInitialTokenFromUrl = (): string =>
  useMemo(() => {
    const url = new URL(window.location.href);
    return extractTokenFromUrl(url) ?? "";
  }, []);
