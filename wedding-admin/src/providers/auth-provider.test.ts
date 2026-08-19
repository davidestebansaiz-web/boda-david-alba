import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authProvider } from "./auth-provider";

const accessToken = "jwt-token";

describe("authProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores token on successful login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          accessToken,
          tokenType: "Bearer",
          expiresIn: 1800,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await authProvider.login({ username: "admin", password: "secret" });

    expect(window.localStorage.getItem("wedding_admin_access_token")).toBe(accessToken);
  });

  it("rejects login with invalid credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "UNAUTHORIZED",
          message: "Invalid admin credentials",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await expect(authProvider.login({ username: "admin", password: "wrong" })).rejects.toThrow(
      /invalid admin credentials/i,
    );
  });

  it("clears token and rejects on checkError with 401", async () => {
    window.localStorage.setItem("wedding_admin_access_token", accessToken);

    await expect(authProvider.checkError({ status: 401 })).rejects.toEqual({ status: 401 });
    expect(window.localStorage.getItem("wedding_admin_access_token")).toBeNull();
  });
});
