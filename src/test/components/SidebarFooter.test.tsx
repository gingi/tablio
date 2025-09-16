import { render, screen } from "@testing-library/react";
import App from "../../App";

// Simple mock for build meta globals if tests run without Vite define (handled already, but safe)

describe("Sidebar footer", () => {
    it("renders GitHub link in sidebar footer", () => {
        render(<App />);
        const link = screen.getByRole("link", { name: /open github repository/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "https://github.com/gingi/tablio");
    });

    it("shows version/build text", () => {
        render(<App />);
        // Match something like v0.1.0 (build dev) OR vX (build Y-abc123)
        const versionLike = screen.getAllByText(/v[0-9].*/i).some(el => /v.+\(/.test(el.textContent || ""));
        expect(versionLike).toBe(true);
    });
});
