import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import React from "react";
import { Controls } from "@/components/Controls";
import type { TableData, Guest } from "@/components/TablePlanner";

describe("Controls destructive confirm", () => {
    const mkTable = (id: string, guests: number): TableData => ({
        id,
        name: `Table ${id}`,
        seats: 12,
        x: 0,
        y: 0,
        guests: Array.from({ length: guests }).map((_, i) => ({
            id: `${id}-g${i}`,
            name: `Guest ${i}`,
            tableId: id,
            seatNumber: i,
        })) as Guest[],
    });

    test("shows and handles reset confirmation", () => {
        const onAddTable = vi.fn();
        const onImportGuests = vi.fn();
        const onImportLayout = vi.fn();
        const onAutoLayout = vi.fn();
        const onUndo = vi.fn();
        const onResetAssignments = vi.fn();

        render(
            <Controls
                onAddTable={onAddTable}
                onImportGuests={onImportGuests}
                onImportLayout={onImportLayout}
                onAutoLayout={onAutoLayout}
                onUndo={onUndo}
                onResetAssignments={onResetAssignments}
                tables={[mkTable("t1", 2)]}
                guests={[]}
                canUndo={true}
            />
        );

        const resetBtn = screen.getByRole("button", { name: /reset all assignments/i });
        fireEvent.click(resetBtn);
        expect(
            screen.getByText(/clear all guest assignments\? this cannot be undone/i)
        ).toBeInTheDocument();

        // Cancel first
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(onResetAssignments).not.toHaveBeenCalled();

        // Open again and confirm
        fireEvent.click(resetBtn);
        fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
        expect(onResetAssignments).toHaveBeenCalledTimes(1);
    });
});
