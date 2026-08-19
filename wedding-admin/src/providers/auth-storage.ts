const ACCESS_TOKEN_STORAGE_KEY = "wedding_admin_access_token";

export const getStoredAccessToken = (): string | null => window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const setStoredAccessToken = (token: string): void => {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

export const clearStoredAccessToken = (): void => {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};
