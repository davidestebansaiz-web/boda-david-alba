import type { AuthProvider } from "react-admin";

import { ApiError } from "../infrastructure/api-error";
import { postJson } from "../infrastructure/http-client";
import { clearStoredAccessToken, getStoredAccessToken, setStoredAccessToken } from "./auth-storage";

interface LoginPayload {
  username?: string;
  password?: string;
}

interface LoginResponse {
  accessToken: string;
}

const asStatusCode = (error: unknown): number | null => {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }

  return null;
};

export const authProvider: AuthProvider = {
  login: async (params: LoginPayload) => {
    const username = typeof params.username === "string" ? params.username.trim() : "";
    const password = typeof params.password === "string" ? params.password : "";

    if (username.length === 0 || password.length === 0) {
      throw new Error("Username and password are required");
    }

    const response = await postJson<LoginResponse>("/admin/auth/login", {
      username,
      password,
    });

    setStoredAccessToken(response.accessToken);
  },

  logout: async () => {
    clearStoredAccessToken();
  },

  checkAuth: async () => {
    const token = getStoredAccessToken();
    if (!token) {
      throw new Error("Missing auth token");
    }
  },

  checkError: async (error: unknown) => {
    const status = asStatusCode(error);

    if (status === 401) {
      clearStoredAccessToken();
      throw error;
    }
  },

  getPermissions: async () => null,
};
