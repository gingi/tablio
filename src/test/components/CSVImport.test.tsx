import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CSVImport } from "@/components/CSVImport";
import { describe, test, expect, vi } from "vitest";

function createFile(name: string, content: string, type = "text/csv") {
    const file = new File([content], name, { type });
    // Override text() to ensure consistent async timing in tests
    file.text = () => Promise.resolve(content);
    return file;
}

describe("CSVImport", () => {
    test("imports CSV and calls onImport", async () => {
        const onImport = vi.fn();
        render(<CSVImport onImport={onImport} />);
        const file = createFile("guests.csv", "Name,Category\nAlice,Family\nBob,Friends");
        fireEvent.click(screen.getByText(/upload csv/i));
        const input = document.querySelector(
            'input[type="file"][accept=".csv"]'
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => expect(onImport).toHaveBeenCalled(), { timeout: 1500 });
        expect(onImport.mock.calls[0][0].length).toBe(2);
    });
});
