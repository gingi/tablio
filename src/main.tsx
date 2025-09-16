
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { appVersion, appBuild, appCommit } from "./buildMeta";

// Attach build metadata as data-* attributes on <body> for external tooling / debugging.
// This runs before React mounts so attributes are present immediately.
if (typeof document !== "undefined" && document.body) {
    document.body.dataset.appVersion = appVersion;
    document.body.dataset.appBuild = appBuild;
    if (appCommit) {
        document.body.dataset.appCommit = appCommit;
    }
}

createRoot(document.getElementById("root")!).render(<App />);
  