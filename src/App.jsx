import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { FilterProvider } from "./context/FilterContext";
import { NotificationProvider } from "./context/NotificationContext";
import UserProvider from "./context/UserContext";
import AppRouter from "./router/AppRouter";
import NotificationPanel from "./components/NotificationPanel";

export default function App() {
  const [hasError, setHasError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    console.log("✅ App component mounted");
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Global error handler
    const handleError = (event) => {
      console.error("Global error:", event.error);
      setHasError(true);
      setErrorMsg(event.error?.message || String(event.error));
    };

    const handleUnhandledRejection = (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      setHasError(true);
      setErrorMsg(event.reason?.message || String(event.reason));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FEE2E2" }}>
        <div style={{ maxWidth: "500px", padding: "40px", backgroundColor: "#FFF", borderRadius: "8px", border: "1px solid #FECACA" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#DC2626", marginBottom: "16px" }}>⚠️ Error</h1>
          <p style={{ fontSize: "14px", color: "#991B1B", marginBottom: "16px", fontFamily: "monospace" }}>{errorMsg}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: "8px 16px", backgroundColor: "#0B5FFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <FilterProvider>
              <UserProvider>
                <NotificationPanel />
                <AppRouter />
              </UserProvider>
            </FilterProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}