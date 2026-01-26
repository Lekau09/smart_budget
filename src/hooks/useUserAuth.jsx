// src/hooks/useUserAuth.jsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const useUserAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data locally
    setTimeout(() => {
      setUser({
        id: 1, // Add user ID for API calls
        name: "Mike William",
        email: "mike@example.com",
        avatar: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
      });
    }, 500);
  }, []);

  return { user, setUser };
};

export default useUserAuth;
