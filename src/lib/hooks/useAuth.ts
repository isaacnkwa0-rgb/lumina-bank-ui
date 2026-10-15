"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getToken, setToken, removeToken, clearAccessToken, getUser, setUser, setRefreshToken, type AuthUser } from "../auth";
import { authApi } from "../api";
import { useRouter } from "next/navigation";

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

const TWO_FA_TEMP_KEY = "lumina_2fa_temp";
const TWO_FA_METHOD_KEY = "lumina_2fa_method";

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  verifyTwoFactorWithRecovery: (recoveryCode: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logoutAll: () => Promise<void>;
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
    if (storedUser) setUserState(storedUser);
    if (storedToken) setTokenState(storedToken);
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

  // Clear the short-lived access token when the tab/browser is closed.
  // The refresh token persists in localStorage so the next page load silently re-authenticates
  // via the 401 interceptor — no visible logout unless the refresh token has also expired.
  useEffect(() => {
    if (!token) return;
    window.addEventListener("beforeunload", clearAccessToken);
    return () => window.removeEventListener("beforeunload", clearAccessToken);
  }, [token]);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await authApi.login(identifier, password);
    const data = response.data.data;

    if (data.requiresTwoFactor) {
      sessionStorage.setItem(TWO_FA_TEMP_KEY, data.tempToken);
      sessionStorage.setItem(TWO_FA_METHOD_KEY, data.twoFactorMethod ?? "TOTP");
      router.push("/verify-2fa");
      return;
    }

    const { accessToken, refreshToken, user } = data as { accessToken: string; refreshToken: string; user: AuthUser };
    setToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    setTokenState(accessToken);
    setUserState(user);
    router.push(user.role === "ADMIN" || user.role === "AGENT" ? "/admin" : "/dashboard");
  }, [router]);

  const finishTwoFactorLogin = useCallback(async (accessToken: string, refreshToken: string) => {
    setToken(accessToken);
    setRefreshToken(refreshToken);
    sessionStorage.removeItem(TWO_FA_TEMP_KEY);
    sessionStorage.removeItem(TWO_FA_METHOD_KEY);
    const meResponse = await authApi.me();
    const userData = meResponse.data.data as AuthUser;
    setUser(userData);
    setTokenState(accessToken);
    setUserState(userData);
    router.push(userData.role === "ADMIN" || userData.role === "AGENT" ? "/admin" : "/dashboard");
  }, [router]);

  const verifyTwoFactor = useCallback(async (code: string) => {
    const tempToken = sessionStorage.getItem(TWO_FA_TEMP_KEY);
    if (!tempToken) throw new Error("Session expired. Please log in again.");
    const response = await authApi.verify2FA(tempToken, code);
    const { accessToken, refreshToken } = response.data.data;
    await finishTwoFactorLogin(accessToken, refreshToken);
  }, [finishTwoFactorLogin]);

  const verifyTwoFactorWithRecovery = useCallback(async (recoveryCode: string) => {
    const tempToken = sessionStorage.getItem(TWO_FA_TEMP_KEY);
    if (!tempToken) throw new Error("Session expired. Please log in again.");
    const response = await authApi.verify2FAWithRecovery(tempToken, recoveryCode);
    const { accessToken, refreshToken } = response.data.data;
    await finishTwoFactorLogin(accessToken, refreshToken);
  }, [finishTwoFactorLogin]);

  const refreshUser = useCallback(async () => {
    const meResponse = await authApi.me();
    const userData = meResponse.data.data as AuthUser;
    setUser(userData);
    setUserState(userData);
  }, []);

  const logoutAll = useCallback(async () => {
    await authApi.logoutAll().catch(() => {});
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    removeToken();
    setTokenState(null);
    setUserState(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    verifyTwoFactor,
    verifyTwoFactorWithRecovery,
    refreshUser,
    logoutAll,
    logout,
  };
}
