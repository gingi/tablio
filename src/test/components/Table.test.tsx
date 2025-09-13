import { render, screen } from "@testing-library/react";
import React from "react";
import { Table } from "@/components/Table";
import type { TableData, Guest } from "@/components/TablePlanner";
import { describe, test, expect } from "vitest";

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
            />
        );
        expect(screen.getByText("12/12")).toBeInTheDocument();
    });
});
