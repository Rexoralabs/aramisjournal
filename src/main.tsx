import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyStyleMode } from "./hooks/useStyleMode";

applyStyleMode();
createRoot(document.getElementById("root")!).render(<App />);
