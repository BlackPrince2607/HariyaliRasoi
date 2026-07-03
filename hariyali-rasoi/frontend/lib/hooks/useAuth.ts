"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/auth/login");
  }, [router]);

  const setToken = useCallback((token: string) => {
    localStorage.setItem("admin_token", token);
    document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }, []);

  const isAuthenticated = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("admin_token");
  }, []);

  return { logout, setToken, isAuthenticated };
}
