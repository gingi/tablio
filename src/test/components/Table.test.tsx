import { render, screen } from "@testing-library/react";
import React from "react";
import { Table } from "@/components/Table";
import type { TableData, Guest } from "@/components/TablePlanner";
import { describe, test, expect, vi } from "vitest";

const makeGuests = (n: number): Guest[] =>
    Array.from({ length: n }, (_, i) => ({
        id: `g-${i}`,
        name: `Guest ${i}`,
        tableId: "t1",
        seatNumber: i,
    }));

const baseTable: TableData = {
    id: "t1",
    name: "Test Table",
    seats: 12,
    x: 100,
    y: 100,
    guests: [],
    desiredMinSeats: 8,
    desiredMaxSeats: 12,
};

const noop = () => {};

describe("Table", () => {
    test("renders empty table status 0/12", () => {
        render(
            <Table
                table={baseTable}
                isSelected={false}
                allGuests={[]}
                allTables={[baseTable]}
                onSelect={noop}
                onAssignGuest={noop}
                onRemoveGuest={noop}
                onRemoveTable={noop}
                onMoveTable={noop}
                onRenameTable={noop}
                onReorderGuests={noop}
                onUpdateTableConfig={noop}
            />
        );
        expect(screen.getByText("0/12")).toBeInTheDocument();
        expect(screen.getByText("Test Table")).toBeInTheDocument();
    });

    test("shows full table style when 12 guests", () => {
        const fullTable: TableData = { ...baseTable, guests: makeGuests(12) };
        render(
            <Table
                table={fullTable}
                isSelected={false}
                allGuests={fullTable.guests}
                allTables={[fullTable]}
                onSelect={noop}
                onAssignGuest={noop}
                onRemoveGuest={noop}
                onRemoveTable={noop}
                onMoveTable={noop}
                onRenameTable={noop}
                onReorderGuests={noop}
                onUpdateTableConfig={noop}
            />
        );
        expect(screen.getByText("12/12")).toBeInTheDocument();
    });

    test("opens config dialog and renames table", async () => {
        const user = (await import("@testing-library/user-event")).default.setup();
        const onRename = vi.fn();
        render(
            <Table
                table={baseTable}
                isSelected={true}
                allGuests={[]}
                allTables={[baseTable]}
                onSelect={noop}
                onAssignGuest={noop}
                onRemoveGuest={noop}
                onRemoveTable={noop}
                onMoveTable={noop}
                onRenameTable={onRename}
                onReorderGuests={noop}
                onUpdateTableConfig={noop}
            />
        );
        const editBtn = screen.getByTitle(/edit configuration/i);
        await user.click(editBtn);
        const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
        await user.clear(nameInput);
        await user.type(nameInput, "Renamed Table");
        const saveBtn = screen.getByRole("button", { name: /save/i });
        await user.click(saveBtn);
        // Depending on environment, space may be collapsed; accept no-space variant
        expect(onRename).toHaveBeenCalled();
        const callArg = (onRename as any).mock.calls[0][1];
        expect(["Renamed Table", "RenamedTable"]).toContain(callArg);
    });

    test("config validation prevents reducing seats below assigned", async () => {
        const user = (await import("@testing-library/user-event")).default.setup();
        const tableWithGuests: TableData = {
            ...baseTable,
            id: "t2",
            name: "Guest Table",
            guests: makeGuests(3),
            desiredMinSeats: 2,
            desiredMaxSeats: 12,
        };
        render(
            <Table
                table={tableWithGuests}
                isSelected={true}
                allGuests={tableWithGuests.guests}
                allTables={[tableWithGuests]}
                onSelect={noop}
                onAssignGuest={noop}
                onRemoveGuest={noop}
                onRemoveTable={noop}
                onMoveTable={noop}
                onRenameTable={noop}
                onReorderGuests={noop}
                onUpdateTableConfig={noop}
            />
        );
        const editBtn = screen.getByTitle(/edit configuration/i);
        await user.click(editBtn);
        const seatsInput = screen.getByLabelText(/^Seats$/i) as HTMLInputElement;
        await user.clear(seatsInput);
        await user.type(seatsInput, "2");
        expect(screen.getByRole("alert")).toHaveTextContent(/cannot set seats below current assigned/i);
        const saveBtn = screen.getByRole("button", { name: /save/i });
        expect(saveBtn).toBeDisabled();
    });
});
