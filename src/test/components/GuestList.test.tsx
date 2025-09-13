import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import React from "react";
import { GuestList } from "@/components/GuestList";
import type { Guest } from "@/components/TablePlanner";

const guests: Guest[] = [
    { id: "g1", name: "Alpha Person", category: "Family" },
    { id: "g2", name: "Beta Person", category: "Friends" },
];

describe("GuestList", () => {
    test("renders guests and filters by search", () => {
        render(
            <GuestList
                guests={guests}
                selectedGuests={new Set()}
                onToggleSelection={() => undefined}
                onClearSelection={() => undefined}
            />
        );
        expect(screen.getByText(/Unassigned Guests/i)).toBeInTheDocument();
        expect(screen.getByText(/Alpha Person/)).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText(/search guests/i), {
            target: { value: "Beta" },
        });
        expect(screen.queryByText(/Alpha Person/)).not.toBeInTheDocument();
        expect(screen.getByText(/Beta Person/)).toBeInTheDocument();
    });
});
