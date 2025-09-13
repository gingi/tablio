import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import React from "react";
import { Table } from "@/components/Table";
import type { TableData, Guest } from "@/components/TablePlanner";

describe("Table remove confirmation", () => {
    const baseTable: TableData = {
        id: "t1",
        name: "Main Table",
        seats: 12,
        x: 100,
        y: 100,
        guests: [],
    };

    const noop = () => {};

    test("shows confirmation dialog and removes on confirm", () => {
        const onRemoveTable = vi.fn();
        render(
            <Table
                table={baseTable}
                isSelected={true}
                allGuests={[] as Guest[]}
                allTables={[baseTable]}
                onSelect={noop}
                onAssignGuest={noop}
                onRemoveGuest={noop}
                onRemoveTable={onRemoveTable}
                onMoveTable={noop}
                onRenameTable={noop}
            />
        );

        const removeBtn = screen.getByRole("button", { name: /remove table/i });
        fireEvent.click(removeBtn);
        expect(screen.getByText(/remove this table\?/i)).toBeInTheDocument();
        // Cancel first
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(onRemoveTable).not.toHaveBeenCalled();
        // Re-open
        fireEvent.click(removeBtn);
        fireEvent.click(screen.getByRole("button", { name: /^remove$/i }));
        expect(onRemoveTable).toHaveBeenCalledTimes(1);
    });
});
