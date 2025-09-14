/// <reference types="vite/client" />

// Global compile-time constants injected via Vite define
declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;

// (Optional) augment ImportMetaEnv if we want explicit constants later.
// interface ImportMetaEnv {
//   readonly VITE_SOME_KEY?: string;
// }
// interface ImportMeta { readonly env: ImportMetaEnv }
