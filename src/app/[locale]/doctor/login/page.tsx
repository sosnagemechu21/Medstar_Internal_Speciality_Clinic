"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveLocale } from "@/lib/i18n-utils";

export default function DoctorLoginPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);

  useEffect(() => {
    // Automatically redirect anyone trying to access this old route
    // to the main, unified login page.
    router.replace(`/${locale}/login`);
  }, [router, locale]);

  // Show a simple loading message for the split second before the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ms-blue border-t-transparent"></div>
        <p className="text-slate-500 text-sm font-medium">Redirecting to main login...</p>
      </div>
    </div>
  );
}