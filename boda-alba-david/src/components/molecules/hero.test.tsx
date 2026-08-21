import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Hero } from "./hero";

const fetchMock = vi.fn<typeof fetch>();

const renderHero = (): void => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Hero />
    </QueryClientProvider>,
  );
};

describe("Hero", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the accepted invitation count in the title", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ count: 3 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    renderHero();

    expect(await screen.findByRole("heading", { name: "RSVP por token · 3 invitaciones aceptadas" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/public/invitations/accepted/count", { method: "GET" });
  });
});
