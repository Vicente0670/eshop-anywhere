import MusicPlayer from "./MusicPlayer.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("offscreen-root")!).render(
  <StrictMode>
    <MusicPlayer />
  </StrictMode>
);