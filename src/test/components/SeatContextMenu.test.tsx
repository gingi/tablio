import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SeatContextMenu } from "@/components/SeatContextMenu";
import type { Guest, TableData } from "@/components/TablePlanner";
import { describe, test, expect, vi } from "vitest";

const guests: Guest[] = [
    { id: "g1", name: "Alice", category: "Family" },
    { id: "g2", name: "Bob", category: "Friends" },
];

const tables: TableData[] = [{ id: "t1", name: "Table 1", seats: 12, x: 0, y: 0, guests: [] }];

describe("SeatContextMenu", () => {
    test("filters and assigns guest", () => {
        const onAssignGuest = vi.fn();
        const onClose = vi.fn();
        render(
            <SeatContextMenu
                isOpen
                position={{ x: 200, y: 200 }}
                seatNumber={3}
                currentGuest={undefined}
                allGuests={guests}
                allTables={tables}
                onClose={onClose}
                onAssignGuest={onAssignGuest}
                onRemoveGuest={() => undefined}
                currentTableName="t1"
            />
        );
        fireEvent.change(screen.getByPlaceholderText(/search guests/i), {
            target: { value: "Bob" },
        });
        const bob = screen.getByText("Bob");
        fireEvent.click(bob);
        expect(onAssignGuest).toHaveBeenCalledWith("g2", 3);
        expect(onClose).toHaveBeenCalled();
    });
});
