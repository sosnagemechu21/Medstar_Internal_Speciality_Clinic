"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function useRequireAuth(redirectPath: string) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const localePart = pathname.split("/")[1] ?? "en";
      router.replace(`/${localePart}/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isAuthenticated, loading, redirectPath, router, pathname]);

  return { isAuthenticated, loading };
}
