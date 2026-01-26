import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BudgetProvider } from "./context/BudgetContext.jsx";
import "./index.css"; // Load the complete design system CSS

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BudgetProvider>
      <App />
    </BudgetProvider>
  </React.StrictMode>
);
