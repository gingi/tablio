import "@testing-library/jest-dom";

// Polyfill matchMedia if needed by some components
if (typeof window !== "undefined" && !window.matchMedia) {
    // @ts-expect-error jsdom missing impl
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
}

// Mock toast if sonner version aliasing causes issues
try {
    // dynamic import just to ensure module resolution
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("sonner");
} catch {
    // fallback mock
    // @ts-expect-error test shim
    globalThis.toast = { success() {}, error() {}, info() {} };
}
