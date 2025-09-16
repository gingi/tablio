# Tablio – Event Seating Planner

Tablio is a minimalist, drag-and-drop seating planner for events up to ~160 guests. It focuses on clarity, fast seat assignment, and immediate visual feedback. Built with React, TypeScript, Vite, Tailwind, and ShadCN-style UI primitives.

Key capabilities:
- Oval 12‑seat tables with live capacity coloring (gray / yellow / green / blue / red states)
- Seat-level guest placement with arc-length distributed seat geometry
- Drag & drop + per-seat context menu assignment
- Guest categories (Family, Friends, Colleagues, VIP, custom) with search & filtering
- Local persistence (auto-saved to browser storage)
- CSV guest import + full layout export/import (JSON)
- Undo history, assignment summary, and table utilization indicators
- Accessible dialogs, keyboard escape handling, and confirmation for destructive actions

Planned / potential enhancements (see `src/spec.md` for the full specification): multi-event sets, dietary tags, printable layouts, collaboration, preference constraints, analytics.

## Running the code

Install dependencies:

```
npm i
```

Start dev server:

```
npm run dev
```

Run tests:

```
npm test
```

Lint & type check:

```
npm run lint
```

## Deployment (GitHub Pages)

![Deploy](https://github.com/gingi/tablio/actions/workflows/deploy.yml/badge.svg)

This repository deploys automatically to **GitHub Pages** via `.github/workflows/deploy.yml`. On each push to `main` (or `master`) the workflow:

1. Installs dependencies
2. Runs the test suite
3. Builds the project with a base path of `/<repo-name>/` (via `VITE_BASE` env var)
4. Publishes the `build/` output to the `gh-pages` environment

### Setup Steps

1. In your repository settings, enable GitHub Pages with the source set to "GitHub Actions".
2. Push to `main` – the workflow will create/update the deployment.
3. Your app will be available at: `https://<username>.github.io/<repo-name>/`.

If you fork or rename the repo, no code changes are required. The workflow injects `VITE_BASE` dynamically based on the repository name. To override locally, create `.env`:

```
VITE_BASE=/your-sub-path/
```

For a root user/organization Pages site (`<username>.github.io`), set `VITE_BASE=/`.

## Project Structure

```
src/
	components/        # UI + feature components (tables, guests, dialogs)
	components/ui/     # ShadCN/Radix-based primitive wrappers
	styles/            # Global styles
	spec.md            # Extended functional specification
	test/              # Component & interaction tests (Vitest + RTL)
```

## Design Notes

- Tables fixed at 12 seats to simplify distribution + layout heuristics.
- Seat positions computed via sampled ellipse + equal arc-length spacing.
- State stored in localStorage for frictionless offline continuity.
- Version-pinned import aliases allow stable UI lib upgrades with minimal diff noise.

## Contributing

PRs welcome: keep changes focused, run `npm test` + `npm run lint` before submitting.

## License

Released under the MIT License – see the `LICENSE` file for details.
