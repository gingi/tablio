import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TablePlanner } from "@/components/TablePlanner";

// Basic smoke & interaction tests

describe("TablePlanner", () => {
    test("renders branding and guest count", () => {
        render(<TablePlanner />);
        expect(screen.getByText(/Tablio/i)).toBeInTheDocument();
        // Guest count line uses 'guests' lowercase after number
        expect(screen.getByText(/guests$/i)).toBeInTheDocument();
    });

    test("can collapse and expand sidebar", () => {
        render(<TablePlanner />);
        const toggle = screen.getByLabelText(/Collapse sidebar/i);
        fireEvent.click(toggle);
        expect(screen.getByLabelText(/Expand sidebar/i)).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText(/Expand sidebar/i));
        expect(screen.getByLabelText(/Collapse sidebar/i)).toBeInTheDocument();
    });
});
