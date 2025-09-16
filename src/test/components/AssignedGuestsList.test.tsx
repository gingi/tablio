import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AssignedGuestsList } from "@/components/AssignedGuestsList";
import type { Guest, TableData } from "@/components/TablePlanner";
import { describe, test, expect } from "vitest";

const tables: TableData[] = [{ id: "t1", name: "T1", seats: 12, x: 0, y: 0, guests: [] }];

const guests: Guest[] = [
    { id: "g1", name: "Guest One", tableId: "t1", seatNumber: 0 },
    { id: "g2", name: "Guest Two", tableId: "t1", seatNumber: 1 },
];

describe("AssignedGuestsList", () => {
    test("shows assigned guests and search filter", () => {
        render(<AssignedGuestsList guests={guests} tables={tables} />);
        expect(screen.getByText(/Assigned Guests \(2\)/)).toBeInTheDocument();
        // Open collapsible (starts closed by default)
        fireEvent.click(screen.getByRole("button", { name: /assigned guests/i }));
        fireEvent.change(screen.getByPlaceholderText(/search assigned guests/i), {
            target: { value: "Two" },
        });
        expect(screen.queryByText("Guest One")).not.toBeInTheDocument();
        expect(screen.getByText("Guest Two")).toBeInTheDocument();
    });
});
