import { beforeEach, describe, expect, it, vi } from "vitest";

import { dataProvider } from "./data-provider";

const adminHeadersMatcher = {
  authorization: "Bearer test-token",
};

describe("dataProvider", () => {
  beforeEach(() => {
    window.localStorage.setItem("wedding_admin_access_token", "test-token");
    vi.restoreAllMocks();
  });

  it("injects bearer token and applies client-side list sorting/filter/pagination", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: "2",
            token: "token-b",
            guestName: "Carlos",
            maxGuests: 2,
            adminNotes: null,
            qrTargetUrl: "https://albaydavidsecasan.es/token-b",
            qrSvg: "<svg>token-b</svg>",
            qrUpdatedAt: "2026-03-24T11:00:00.000Z",
            createdAt: "2026-03-24T10:00:00.000Z",
            updatedAt: "2026-03-24T11:00:00.000Z",
          },
          {
            id: "1",
            token: "token-a",
            guestName: "Alba",
            maxGuests: 4,
            adminNotes: "VIP",
            qrTargetUrl: "https://albaydavidsecasan.es/token-a",
            qrSvg: "<svg>token-a</svg>",
            qrUpdatedAt: "2026-03-24T12:00:00.000Z",
            createdAt: "2026-03-24T09:00:00.000Z",
            updatedAt: "2026-03-24T12:00:00.000Z",
          },
        ]),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const result = await dataProvider.getList("invitations", {
      pagination: { page: 1, perPage: 1 },
      sort: { field: "guestName", order: "ASC" },
      filter: { q: "al" },
    } as any);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/admin/invitations",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );

    const firstCallHeaders = new Headers((fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.headers);
    expect(firstCallHeaders.get("authorization")).toBe(adminHeadersMatcher.authorization);

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.guestName).toBe("Alba");
  });

  it("sends PATCH update with admin bearer token", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "1",
          token: "token-a",
          guestName: "Alba Updated",
          maxGuests: 5,
          adminNotes: "Updated",
          qrTargetUrl: "https://albaydavidsecasan.es/token-a-updated",
          qrSvg: "<svg>updated</svg>",
          qrUpdatedAt: "2026-03-24T13:00:00.000Z",
          createdAt: "2026-03-24T09:00:00.000Z",
          updatedAt: "2026-03-24T13:00:00.000Z",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const result = await dataProvider.update("invitations", {
      id: "1",
      data: {
        guestName: "Alba Updated",
        maxGuests: 5,
        adminNotes: "Updated",
      },
      previousData: {
        id: "1",
      },
    } as any);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/admin/invitations/1",
      expect.objectContaining({
        method: "PATCH",
      }),
    );

    const patchRequest = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const patchHeaders = new Headers(patchRequest.headers);
    expect(patchHeaders.get("authorization")).toBe(adminHeadersMatcher.authorization);
    expect(patchRequest.body).toContain("Alba Updated");

    expect(result.data.guestName).toBe("Alba Updated");
  });

  it("sends explicit regenerateQr request in PATCH update", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "1",
          token: "token-a",
          guestName: "Alba Updated",
          maxGuests: 5,
          adminNotes: "Updated",
          qrTargetUrl: "https://albaydavidsecasan.es/token-a-updated",
          qrSvg: "<svg>regenerated</svg>",
          qrUpdatedAt: "2026-03-24T13:05:00.000Z",
          createdAt: "2026-03-24T09:00:00.000Z",
          updatedAt: "2026-03-24T13:05:00.000Z",
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    await dataProvider.update("invitations", {
      id: "1",
      data: {
        regenerateQr: true,
      },
      previousData: {
        id: "1",
      },
    } as any);

    const patchRequest = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(patchRequest.body).toContain("\"regenerateQr\":true");
  });
});
