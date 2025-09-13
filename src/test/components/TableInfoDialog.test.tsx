import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TableInfoDialog } from "@/components/TableInfoDialog";
import type { Guest, TableData } from "@/components/TablePlanner";
import { describe, test, expect, vi } from "vitest";

const guests: Guest[] = [
    { id: "g1", name: "Alpha", tableId: "t1", seatNumber: 0 },
    { id: "g2", name: "Beta", tableId: "t1", seatNumber: 1 },
];

const table: TableData = { id: "t1", name: "Alpha Table", seats: 12, x: 0, y: 0, guests };

// Using minimal props consistent with component consumption pattern

describe("TableInfoDialog", () => {
    test("renders table info and removes guest", () => {
        const onRemoveGuest = vi.fn();
        render(
            <TableInfoDialog
                isOpen={true}
                onClose={() => undefined}
                table={table}
                onRemoveGuest={onRemoveGuest}
            />
        );
        expect(screen.getByText("Alpha Table")).toBeInTheDocument();
        expect(screen.getByText("2/12")).toBeInTheDocument();
        const buttons = screen.getAllByRole("button");
        fireEvent.click(
            buttons.find((btn) => btn.textContent === "" && btn !== buttons[buttons.length - 1])!
        );
        expect(onRemoveGuest).toHaveBeenCalled();
    });
});
