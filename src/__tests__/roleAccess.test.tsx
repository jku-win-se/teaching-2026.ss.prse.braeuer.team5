import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeviceCard } from "../components/DeviceCard";
import { DeviceTypeSidebar } from "../components/DeviceTypeSidebar";
import type { Device } from "../types";

const baseDevice: Device = {
  id: "device-1",
  room_id: "room-1",
  name: "Testgeraet",
  type: "Schalter",
  state: { on: true },
};

describe("Role-based access UI", () => {
  it("hides device management actions for members while keeping device controls", () => {
    render(
      <DeviceCard
        device={baseDevice}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onStateChange={vi.fn()}
        canManage={false}
      />
    );

    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("shows device add options only for owners", () => {
    const { rerender } = render(
      <DeviceTypeSidebar
        onSelectType={vi.fn()}
        isOpen={true}
        onClose={vi.fn()}
        canManage={false}
      />
    );

    expect(screen.getByText("Nur Eigentuemer duerfen Geraete hinzufuegen.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Schalter/i })).not.toBeInTheDocument();

    rerender(
      <DeviceTypeSidebar
        onSelectType={vi.fn()}
        isOpen={true}
        onClose={vi.fn()}
        canManage={true}
      />
    );

    expect(screen.getByRole("button", { name: /Schalter/i })).toBeInTheDocument();
  });
});
