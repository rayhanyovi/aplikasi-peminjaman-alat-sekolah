"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { UserSignIn } from "@/lib/handler/api/authHandler";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for saved user and session
  useEffect(() => {
    console.log("Checking localStorage for saved user...");
    const savedUser = localStorage.getItem("user_spas");
    if (savedUser) {
      console.log("Found saved user in localStorage:", savedUser);
      setUser(JSON.parse(savedUser));
    } else {
      console.log("No saved user found in localStorage.");
    }

    // Check for saved session
    const savedSession = localStorage.getItem("user_session");
    if (savedSession) {
      console.log("Found saved session in localStorage:", savedSession);
      const sessionData = JSON.parse(savedSession);
      console.log("Session data:", sessionData);

      // Validate session expiration
      const isSessionExpired = Date.now() / 1000 > sessionData.expires_at;
      if (isSessionExpired) {
        console.log("Session expired");
        logout(); // Optional: automatically logout if session expired
      } else {
        console.log("Session is valid");
      }
    } else {
      console.log("No saved session found in localStorage.");
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await UserSignIn({
        email: username,
        password: password,
      });

      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      const { user, session } = response.data;

      setUser(user);
      localStorage.setItem("user_spas", JSON.stringify(user));
      localStorage.setItem("user_session", JSON.stringify(session));
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error; // Pastikan error dilempar ke `LoginPage`
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out...");
    setUser(null);
    localStorage.removeItem("user_spas");
    localStorage.removeItem("user_session");
    console.log("User and session removed from localStorage");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
