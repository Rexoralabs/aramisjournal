import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { applyStyleMode } from "./hooks/useStyleMode";
import { registerAppWorker } from "./lib/registerAppWorker";

applyStyleMode();
const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
void registerAppWorker();
