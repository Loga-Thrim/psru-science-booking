import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { UserLogin, UserRole } from "../types/types";

const api = import.meta.env.VITE_API as string;

interface AuthContextType {
  user: UserLogin | null;
  login: (
    id: string,
    username: string,
    email: string,
    department: string,
    role: UserRole,
    token?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUser({ payload }: any): UserLogin | null {
  if (!payload) return null;
  const { user_id, username, email, department, role } = payload;
  return {
    user_id: user_id,
    name: username,
    email: email,
    department: department,
    role: role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLogin | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(
    async (
      user_id: string,
      username: string,
      email: string,
      department: string,
      role: UserRole,
      token?: string
    ) => {
      const u: UserLogin = { user_id, name: username, email, department, role };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      if (token) localStorage.setItem("token", token);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userStorage = localStorage.getItem("user");
        if (userStorage) {
          console.log(userStorage);
          const user = JSON.parse(userStorage) as UserLogin;
          setUser(user);
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${api}/verify-token`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          const data = await res.json();
          const user = getUser(data);
          if (user) {
            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
          }
        }
      } catch (err) {
        console.log(err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
