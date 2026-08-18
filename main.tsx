import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CaseReadyApp from "./app/caseready-app";
import "./app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("CaseReady could not find its application root.");
}

createRoot(root).render(
  <StrictMode>
    <CaseReadyApp />
  </StrictMode>,
);
