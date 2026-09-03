import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicInvitationContext } from "../../../services/rsvp-types";
import { RsvpByToken } from ".";

const fetchMock = vi.fn<typeof fetch>();

const createContext = (partial?: Partial<PublicInvitationContext>): PublicInvitationContext => ({
  invitationId: "inv-1",
  token: "token-123456789",
  guestName: "Familia Test",
  maxGuests: 2,
  invitees: [
    { id: "guest-1", displayName: "Persona 1" },
    { id: "guest-2", displayName: "Persona 2" },
  ],
  currentResponses: [
    { inviteeId: "guest-1", attending: false, note: null },
    { inviteeId: "guest-2", attending: false, note: null },
  ],
  ...partial,
});

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

describe("RsvpByToken", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  const renderWithQueryClient = (): void => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RsvpByToken />
      </QueryClientProvider>,
    );
  };

  it("auto-validates token from URL query and opens invitee form", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        createContext({
          token: "qr_prefilled_123",
        }),
      ),
    );

    window.history.pushState({}, "", "/?token=qr_prefilled_123");

    renderWithQueryClient();

    expect(await screen.findByText("Asistencia del grupo")).toBeInTheDocument();
    expect(screen.getByText("Token: qr_prefilled_123")).toBeInTheDocument();
  });

  it("auto-validates token from /rsvp/:token path and opens invitee form", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        createContext({
          token: "qr_path_987654321",
        }),
      ),
    );

    window.history.pushState({}, "", "/rsvp/qr_path_987654321");

    renderWithQueryClient();

    expect(await screen.findByText("Asistencia del grupo")).toBeInTheDocument();
    expect(screen.getByText("Token: qr_path_987654321")).toBeInTheDocument();
  });

  it("validates manually entered token and renders invitee rows", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(createContext()));

    const user = userEvent.setup();
    renderWithQueryClient();

    await user.type(screen.getByLabelText("Token de invitacion"), "manual_token_999");
    await user.click(screen.getByRole("button", { name: "Validar token" }));

    expect(await screen.findByText("Asistencia del grupo")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("submits per-invitee responses including mixed attendance", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          createContext({
            currentResponses: [
              { inviteeId: "guest-1", attending: true, note: "Confirmado" },
              { inviteeId: "guest-2", attending: false, note: null },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          invitationId: "inv-1",
          token: "token-123456789",
          rsvp: {
            status: "ACCEPTED",
            attendingCount: 2,
            message: "Confirmado",
            inviteeResponses: [
              { inviteeId: "guest-1", attending: true, note: "Confirmado" },
              { inviteeId: "guest-2", attending: true, note: "Llega mas tarde" },
            ],
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      );

    const user = userEvent.setup();
    renderWithQueryClient();

    await user.type(screen.getByLabelText("Token de invitacion"), "token-123456789");
    await user.click(screen.getByRole("button", { name: "Validar token" }));

    const attendingOptions = await screen.findAllByRole("radio", { name: "Asistiré" });
    await user.click(attendingOptions[1]);

    const notes = screen.getAllByLabelText("Nota opcional");
    await user.type(notes[1], "Llega mas tarde");
    await user.click(screen.getByRole("button", { name: "Enviar confirmacion" }));

    expect(await screen.findByText("Confirmacion enviada")).toBeInTheDocument();

    const submitCall = fetchMock.mock.calls[1];
    expect(submitCall?.[0]).toContain("/public/invitations/token-123456789/rsvp");

    const requestInit = submitCall?.[1] as RequestInit;
    const payload = JSON.parse(requestInit.body as string) as {
      invitees: Array<{ inviteeId: string; attending: boolean; note: string | null }>;
    };

    expect(payload.invitees).toEqual([
      { inviteeId: "guest-1", attending: true, note: "Confirmado" },
      { inviteeId: "guest-2", attending: true, note: "Llega mas tarde" },
    ]);
  });

  it("keeps form data on submit error so user can retry", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          createContext({
            invitees: [{ id: "guest-1", displayName: "Persona 1" }],
            currentResponses: [{ inviteeId: "guest-1", attending: false, note: null }],
            maxGuests: 1,
          }),
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ message: "No se pudo guardar" }, 400));

    const user = userEvent.setup();
    renderWithQueryClient();

    await user.type(screen.getByLabelText("Token de invitacion"), "token-err-123456");
    await user.click(screen.getByRole("button", { name: "Validar token" }));

    const noteInput = await screen.findByLabelText("Nota opcional");
    await user.type(noteInput, "Intento con error");
    await user.click(screen.getByRole("button", { name: "Enviar confirmacion" }));

    await waitFor(() => {
      expect(screen.getByText("No se pudo guardar")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Nota opcional")).toHaveValue("Intento con error");
    expect(screen.getByText("Asistencia del grupo")).toBeInTheDocument();
  });
});
