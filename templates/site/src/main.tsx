import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/print.css";
import { App } from "./App";
import { isPrint } from "./lib/route";
import { preparePrint } from "./lib/print";
import { story } from "./content/story";

document.title = `${story.person.name} — ${story.person.title}`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (isPrint) requestAnimationFrame(() => setTimeout(preparePrint, 300));
