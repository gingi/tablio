// Vitest global setup: define build/version constants for tests
// These are normally injected by Vite during build via define.
// Using generic placeholder values; adjust if assertions depend on specific patterns.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__APP_VERSION__ = (globalThis as any).__APP_VERSION__ || "0.0.0-test";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__APP_BUILD__ = (globalThis as any).__APP_BUILD__ || "test";
