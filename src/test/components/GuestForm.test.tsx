import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { GuestForm } from "@/components/GuestForm";
import { describe, test, expect, vi } from "vitest";

const tables = [{ id: "t1", name: "Table 1", seats: 12, x: 0, y: 0, guests: [] }];

describe("GuestForm", () => {
    test("opens dialog and adds guest", () => {
        const onAddGuest = vi.fn();
        render(<GuestForm onAddGuest={onAddGuest} tables={tables} />);
        fireEvent.click(screen.getByRole("button", { name: /add guest/i }));
        const dialog = screen.getByRole("dialog");
        const nameInput = within(dialog).getByLabelText(/name \*/i);
        fireEvent.change(nameInput, { target: { value: "Test Person" } });
        // Submit via form submit button inside dialog (exact match Add Guest)
        const submitBtn = within(dialog).getByRole("button", { name: /^Add Guest$/i });
        fireEvent.click(submitBtn);
        expect(onAddGuest).toHaveBeenCalledWith("Test Person", undefined, undefined, undefined);
    });
});
