import React, { createContext, useContext, useState, useCallback } from "react";
import { UserLogin, UserRole } from "../types/types";

interface AuthContextType {
  user: UserLogin | null;
  login: (
    id: number,
    username: string,
    email: string,
    faculty: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLogin | null>(null);

  const login = useCallback( async (id: number, username: string, email: string, faculty: string, role: UserRole) => {
      const user: UserLogin = {
        id: id,
        name: username,
        email: email,
        role: role,
        department: faculty,
      };
      setUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
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
