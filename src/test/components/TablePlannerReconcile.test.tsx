import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { TablePlanner } from "@/components/TablePlanner";

// STORAGE_KEY in component is "table-planner-state"

describe("TablePlanner reconciliation", () => {
    test("reconciles guest with tableId missing from table.guests", async () => {
        // Seed mismatched state: guest g2 references table-1 but table.guests lacks g2
        const state = {
            guests: [
                { id: "g1", name: "Alpha One", tableId: "table-1", seatNumber: 0 },
                { id: "g2", name: "Beta Two", tableId: "table-1" },
            ],
            tables: [
                {
                    id: "table-1",
                    name: "Test Table",
                    seats: 13,
                    x: 200,
                    y: 150,
                    guests: [
                        { id: "g1", name: "Alpha One", tableId: "table-1", seatNumber: 0 },
                    ],
                    desiredMinSeats: 8,
                    desiredMaxSeats: 12,
                    shape: "oval",
                },
            ],
            timestamp: Date.now(),
        };
        localStorage.setItem("table-planner-state", JSON.stringify(state));
        // Clear history to avoid interference
        localStorage.removeItem("table-planner-history");

        render(<TablePlanner />);

        // After reconciliation, Beta Two should appear as a seat (first name + last initial => Leor A)
        await waitFor(() => {
            expect(screen.getByText(/Beta T/)).toBeInTheDocument();
        });
    });
});
