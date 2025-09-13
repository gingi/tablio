import { describe, test, expect } from "vitest";

// Dynamically import each ui component file and assert it exports something
// Keep list explicit to avoid tooling complexity
const uiFiles = [
    "accordion",
    "alert-dialog",
    "alert",
    "aspect-ratio",
    "avatar",
    "badge",
    "breadcrumb",
    "button",
    "calendar",
    "card",
    "carousel",
    "chart",
    "checkbox",
    "collapsible",
    "command",
    "context-menu",
    "dialog",
    "drawer",
    "dropdown-menu",
    "form",
    "hover-card",
    "input-otp",
    "input",
    "label",
    "menubar",
    "navigation-menu",
    "pagination",
    "popover",
    "progress",
    "radio-group",
    "resizable",
    "scroll-area",
    "select",
    "separator",
    "sheet",
    "sidebar",
    "skeleton",
    "slider",
    "sonner",
    "switch",
    "table",
    "tabs",
    "textarea",
    "toggle-group",
    "toggle",
    "tooltip",
    "use-mobile",
    "utils",
];

describe("UI exports", () => {
    for (const file of uiFiles) {
        test(`${file} exports something`, async () => {
            const mod = await import(`@/components/ui/${file}.tsx`).catch(
                () => import(`@/components/ui/${file}.ts`)
            );
            expect(Object.keys(mod).length).toBeGreaterThan(0);
        });
    }
});
