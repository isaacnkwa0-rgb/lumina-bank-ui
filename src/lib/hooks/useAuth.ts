"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getToken, setToken, removeToken, getUser, setUser, setRefreshToken, type AuthUser } from "../auth";
import { authApi } from "../api";
import { useRouter } from "next/navigation";

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

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
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    removeToken();
    setTokenState(null);
    setUserState(null);
    router.push("/login?reason=session_expired");
  }, [router]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(logout, INACTIVITY_MS);
  }, [logout]);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Attach inactivity listeners when authenticated
  useEffect(() => {
    if (!token) return;
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [token, resetInactivityTimer]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const data = response.data.data as unknown as {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    };
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    setTokenState(data.accessToken);
    setUserState(data.user);
    router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
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
