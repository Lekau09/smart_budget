// src/hooks/useUserAuth.jsx
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const useUserAuth = () => {
  const { user } = useAuth();
  
  return { user };
};

export default useUserAuth;
