// Central accessor for build metadata allowing safe fallbacks during tests.
// In production, Vite replaces __APP_VERSION__/__APP_BUILD__ via define.
// In Vitest (node) we may not have those globals, so default to dev values.
// The identifiers __APP_VERSION__/__APP_BUILD__/__APP_COMMIT__ are replaced at build time
// by Vite via the `define` config in `vite.config.ts`. When the app is served via
// GitHub Pages we want literal substitution. If the replacement did not occur
// (e.g. viewing raw source, or a different build tool), we fall back gracefully.
// Additionally support optional `import.meta.env.VITE_*` variables.

// Declare the compile-time tokens so TypeScript doesnt error prior to replacement.
declare const __APP_VERSION__: string | undefined;
declare const __APP_BUILD__: string | undefined;
declare const __APP_COMMIT__: string | undefined;

interface ViteEnv { VITE_APP_VERSION?: string; VITE_APP_BUILD?: string; VITE_APP_COMMIT?: string }
// Narrow import.meta typing without using any.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const viteEnv = (import.meta as unknown as { env?: ViteEnv }).env || {};
const envVersion = viteEnv.VITE_APP_VERSION;
const envBuild = viteEnv.VITE_APP_BUILD;
const envCommit = viteEnv.VITE_APP_COMMIT;

function pick(token: string | undefined, envVar: string | undefined, fallback: string): string {
    // If token is the string 'undefined' or actually undefined, treat as missing.
    if (token === undefined || token === "undefined") {
        return envVar ?? fallback;
    }
    return token;
}

export const appVersion: string = pick(typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined, envVersion, "0.0.0-dev");
export const appBuild: string = pick(typeof __APP_BUILD__ !== "undefined" ? __APP_BUILD__ : undefined, envBuild, "dev");
const rawCommit: string | undefined = pick(typeof __APP_COMMIT__ !== "undefined" ? __APP_COMMIT__ : undefined, envCommit, "dev");
export const appCommit = rawCommit && rawCommit !== "dev" ? rawCommit : undefined;

export function formatVersionBadge(): string {
    const commitPart = appCommit ? ` (${appCommit})` : "";
    return `v${appVersion} (build ${appBuild}${commitPart})`;
}

export default { appVersion, appBuild, appCommit, formatVersionBadge };
