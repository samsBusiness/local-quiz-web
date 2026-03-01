"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "QM";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Defer state updates to avoid cascading renders
        setTimeout(() => {
          setUser({
            _id: payload._id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          });
        }, 0);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
    
    // Defer loading state update as well
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
