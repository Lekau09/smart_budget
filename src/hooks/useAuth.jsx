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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
 
      setUser(data.user);
      localStorage.setItem("sb:user", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
   };
 
   const signup = async (email, password, name) => {
     setLoading(true);
     try {
      const response = await fetch(`${API_BASE}/signup.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
 
       if (!response.ok || !data.success) {
         throw new Error(data.error || "Signup failed");
       }
 
       setUser(data.user);
       localStorage.setItem("sb:user", JSON.stringify(data.user));
       return data.user;
     } catch (error) {
       console.error("Signup error:", error);
       throw error;
     } finally {
       setLoading(false);
     }
   };

  function logout() { setUser(null); localStorage.removeItem("sb:user"); }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
