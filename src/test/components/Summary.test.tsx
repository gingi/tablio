import { render, screen } from "@testing-library/react";
import React from "react";
import { Summary } from "@/components/Summary";

const tables = [
    { id: "t1", name: "Head", seats: 12, x: 0, y: 0, guests: [] },
    { id: "t2", name: "Family", seats: 12, x: 0, y: 0, guests: [{ id: "g1", name: "A" }] },
];

describe("Summary", () => {
    test("renders counts", () => {
        render(<Summary totalGuests={10} assignedGuests={1} tables={tables as any} />);
        expect(screen.getByText(/Guest Assignment/i)).toBeInTheDocument();
        // Accept at least one Tables label present
        expect(screen.getAllByText(/Tables/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Total Seats/i)).toBeInTheDocument();
        expect(screen.getByText(/Table Status/i)).toBeInTheDocument();
    });
});
