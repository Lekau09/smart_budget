import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { BudgetProvider } from "./context/BudgetContext.jsx";
import { FilterProvider } from "./context/FilterContext";
import { NotificationProvider } from "./context/NotificationContext";
import UserProvider from "./context/UserContext";
import "./index.css"; // Load the complete design system CSS

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <NotificationProvider>
            <FilterProvider>
              <UserProvider>
                <App />
              </UserProvider>
            </FilterProvider>
          </NotificationProvider>
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
