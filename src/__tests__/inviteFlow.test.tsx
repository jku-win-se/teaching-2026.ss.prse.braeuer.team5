import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { Sidebar } from "../components/Sidebar";
import Notifications from "../pages/Notifications";
import {
  fetchPendingRoomInvites,
  respondToRoomInvite,
} from "../services/inviteService";

vi.mock("../config/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

vi.mock("../services/inviteService", () => ({
  fetchPendingRoomInvites: vi.fn(),
  respondToRoomInvite: vi.fn(),
}));

describe("Invite flow UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the pending invite count in the sidebar", async () => {
    vi.mocked(fetchPendingRoomInvites).mockResolvedValue([
      {
        id: "invite-1",
        room_id: "room-1",
        room_name: "Wohnzimmer",
        email: "member@example.com",
        role: "member",
        status: "pending",
        created_at: "2026-04-13T08:00:00.000Z",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/rooms"]}>
        <Sidebar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("accepts an invite and reloads the list", async () => {
    vi.mocked(fetchPendingRoomInvites)
      .mockResolvedValueOnce([
        {
          id: "invite-1",
          room_id: "room-1",
          room_name: "Wohnzimmer",
          email: "member@example.com",
          role: "member",
          status: "pending",
          created_at: "2026-04-13T08:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(respondToRoomInvite).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Wohnzimmer" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Annehmen" }));

    await waitFor(() => {
      expect(respondToRoomInvite).toHaveBeenCalledWith("invite-1", "accept");
      expect(screen.getByText("Einladung angenommen.")).toBeInTheDocument();
      expect(screen.getByText("Aktuell gibt es keine offenen Einladungen.")).toBeInTheDocument();
    });
  });
});
