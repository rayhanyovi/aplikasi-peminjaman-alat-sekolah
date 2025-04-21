"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useAuthUser } from "@/lib/handler/authHandler"; // Import useAuthUser

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "siswa";
};

type UserContextType = {
  user: User | null;
  error: string | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user: authUser, error } = useAuthUser();
  const [user, setUser] = useState<User | null>(authUser);

  const setUserFromAuth = (authUser: any) => {
    if (authUser) {
      const newUser: User = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role || "siswa",
      };
      setUser(newUser);
    }
  };

  // Update user ketika authUser berubah
  if (authUser && user?.id !== authUser.id) {
    setUserFromAuth(authUser);
  }

  return (
    <UserContext.Provider value={{ user, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
