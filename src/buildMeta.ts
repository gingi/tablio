// Central accessor for build metadata allowing safe fallbacks during tests.
// In production, Vite replaces __APP_VERSION__/__APP_BUILD__ via define.
// In Vitest (node) we may not have those globals, so default to dev values.
interface GlobalWithMeta {
    __APP_VERSION__?: string;
    __APP_BUILD__?: string | number;
    __APP_COMMIT__?: string;
}

const g = (typeof globalThis !== "undefined" ? (globalThis as GlobalWithMeta) : {}) as GlobalWithMeta;

export const appVersion: string = g.__APP_VERSION__ ?? "0.0.0-dev";
export const appBuild = String(g.__APP_BUILD__ ?? "dev");
export const appCommit = (g.__APP_COMMIT__ && g.__APP_COMMIT__ !== "dev") ? g.__APP_COMMIT__ : undefined;

export function formatVersionBadge(): string {
    const commitPart = appCommit ? ` (${appCommit})` : "";
    return `v${appVersion} (build ${appBuild}${commitPart})`;
}

export default { appVersion, appBuild, appCommit, formatVersionBadge };
