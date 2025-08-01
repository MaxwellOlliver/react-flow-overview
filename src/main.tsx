import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Canvas from "./Canvas.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-screen h-screen overflow-hidden">
      <Canvas />
    </div>
  </StrictMode>,
);
