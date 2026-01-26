import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import useLocalStorage from "../hooks/useLocalStorage";
import ErrorBoundary from "../components/ErrorBoundary";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Settings from "../pages/Settings";

// Features
import Dashboard from "../features/dashboard/Dashboard";
import Transactions from "../features/transactions/Transactions";
import Savings from "../features/savings/Savings";
import Analytics from "../features/analytics/Analytics";
import Goals from "../features/goals/Goals";


function Layout() {
  const [collapsed, setCollapsed] = useLocalStorage("sb:collapsed", false);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 860 && !collapsed) setCollapsed(true);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed, setCollapsed]);

  return (
    <div className="app-wrapper">
      <div className={`app-sidebar-wrapper ${collapsed ? "collapsed" : ""}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <div className="app-main">
        <div className="app-navbar">
          <Navbar onToggle={() => setCollapsed(c => !c)} />
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected app routes (with sidebar & navbar) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* Wrap critical pages in ErrorBoundary to avoid blank screens */}
        <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="transactions" element={<ErrorBoundary><Transactions /></ErrorBoundary>} />
        <Route path="savings" element={<ErrorBoundary><Savings /></ErrorBoundary>} />
        <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
        <Route path="goals" element={<ErrorBoundary><Goals /></ErrorBoundary>} />

        <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
      </Route>

      {/* Backward compatibility: /dashboard redirects to /app/dashboard */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

      {/* Fallback: unknown routes go to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
