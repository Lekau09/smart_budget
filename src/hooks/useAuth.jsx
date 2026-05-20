import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sb:user");
    if (s) try { setUser(JSON.parse(s)); } catch { localStorage.removeItem("sb:user"); }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an unexpected response. Make sure XAMPP (Apache + MySQL) is running.");
      }
      console.log('[useAuth.login] API response:', data);
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
 
      console.log('[useAuth.login] Setting user:', data.user);
      setUser(data.user);
      localStorage.setItem("sb:user", JSON.stringify(data.user));
      console.log('[useAuth.login] User state updated, user.id:', data.user.id);
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
   };
 
   const signup = async (email, password, name, phone_number) => {
     setLoading(true);
     try {
      const response = await fetch(`${API_BASE}/signup.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone_number }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an unexpected response. Make sure XAMPP (Apache + MySQL) is running.");
      }
      console.log('[useAuth.signup] API response:', data);
 
       if (!response.ok || !data.success) {
         throw new Error(data.error || "Signup failed");
       }
 
       console.log('[useAuth.signup] Setting user:', data.user);
       setUser(data.user);
       localStorage.setItem("sb:user", JSON.stringify(data.user));
       console.log('[useAuth.signup] User state updated, user.id:', data.user.id);
       
       // Store SMS ingest credentials if available
       if (data.sms_ingest) {
         localStorage.setItem("sb:sms_ingest", JSON.stringify(data.sms_ingest));
       }
       
       return data;
     } catch (error) {
       console.error("Signup error:", error);
       throw error;
     } finally {
       setLoading(false);
     }
   };

  function logout() {
    setUser(null);
    // Clear all user-specific data so next login starts fresh
    localStorage.removeItem("sb:user");
    localStorage.removeItem("sb:sms_ingest");
    localStorage.removeItem("sb:emailNotif");
    localStorage.removeItem("sb:weeklyDigest");
    localStorage.removeItem("sb:budgetAlerts");
    localStorage.removeItem("sb:theme");
    localStorage.removeItem("sb:currency");
    localStorage.removeItem("sb:language");
    localStorage.removeItem("sb:digest_seen");
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
