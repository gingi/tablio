import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { Controls } from "../../components/Controls";

import type { Guest, TableData } from "@/components/TablePlanner";
const mkTable = (id: string, name: string, guests: Guest[] = []): TableData => ({
    id,
    name,
    seats: 12,
    x: 0,
    y: 0,
    guests,
});

describe("Controls", () => {
    test("disables undo and reset appropriately and enables after state changes", async () => {
        const user = userEvent.setup();
        const onAddTable = vi.fn();
        const onImportGuests = vi.fn();
        const onImportLayout = vi.fn();
        const onAutoLayout = vi.fn();
        const onUndo = vi.fn();
        const onResetAssignments = vi.fn();

        const { rerender } = render(
            <Controls
                onAddTable={onAddTable}
                onImportGuests={onImportGuests}
                onImportLayout={onImportLayout}
                onAutoLayout={onAutoLayout}
                onUndo={onUndo}
                onResetAssignments={onResetAssignments}
                tables={[]}
                guests={[]}
                canUndo={false}
            />
        );

        const undoBtn = screen.getByRole("button", { name: /undo last action/i });
        const resetBtn = screen.getByRole("button", { name: /reset all assignments/i });
        const autoLayoutBtn = screen.getByRole("button", { name: /auto layout tables/i });

        expect(undoBtn).toBeDisabled();
        expect(resetBtn).toBeDisabled();
        expect(autoLayoutBtn).toBeDisabled();

        // Simulate adding a table and enabling undo
        rerender(
            <Controls
                onAddTable={onAddTable}
                onImportGuests={onImportGuests}
                onImportLayout={onImportLayout}
                onAutoLayout={onAutoLayout}
                onUndo={onUndo}
                onResetAssignments={onResetAssignments}
                tables={[mkTable("t1", "Table 1")]}
                guests={[]}
                canUndo={true}
            />
        );

        expect(screen.getByRole("button", { name: /auto layout tables/i })).not.toBeDisabled();
        expect(screen.getByRole("button", { name: /undo last action/i })).not.toBeDisabled();

        // Simulate a guest assigned to enable reset/export assignments
        rerender(
            <Controls
                onAddTable={onAddTable}
                onImportGuests={onImportGuests}
                onImportLayout={onImportLayout}
                onAutoLayout={onAutoLayout}
                onUndo={onUndo}
                onResetAssignments={onResetAssignments}
                tables={[mkTable("t1", "Table 1", [{ id: "g1", name: "Guest 1" }])]}
                guests={[]}
                canUndo={true}
            />
        );

        expect(screen.getByRole("button", { name: /reset all assignments/i })).not.toBeDisabled();

        // Click actions
        await user.click(screen.getByRole("button", { name: /undo last action/i }));
        expect(onUndo).toHaveBeenCalled();
        await user.click(screen.getByRole("button", { name: /auto layout tables/i }));
        expect(onAutoLayout).toHaveBeenCalled();
    });
});
