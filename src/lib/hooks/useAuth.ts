"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, setToken, removeToken, getUser, setUser, type AuthUser } from "../auth";
import { authApi } from "../api";
import { useRouter } from "next/navigation";

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const data = response.data.data as unknown as {
      accessToken: string;
      user: AuthUser;
    };
    const newToken = data.accessToken;
    const newUser = data.user;
    setToken(newToken);
    setUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUserState(null);
    router.push("/");
  }, [router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
