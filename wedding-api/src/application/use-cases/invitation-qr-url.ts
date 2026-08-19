export const composeDefaultInvitationQrTargetUrl = (baseUrl: string, token: string): string =>
  `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(token)}`;

