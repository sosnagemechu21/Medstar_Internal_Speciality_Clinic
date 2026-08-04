"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/providers/auth-provider";
import { resolveLocale } from "@/lib/i18n-utils";

export default function DoctorLoginPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const redirect = searchParams.get("redirect") ?? `/${locale}/dashboard`;
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();

  const [doctorIdentifier, setDoctorIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role.toLowerCase() === "doctor" || user.role.toLowerCase() === "admin") {
        router.replace(redirect);
      }
    }
  }, [authLoading, isAuthenticated, user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!doctorIdentifier || !password) {
      setError("Please enter doctor name/email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(doctorIdentifier, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Doctor login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDoctor = (name: string, pass: string) => {
    setDoctorIdentifier(name);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Left side hero */}
      <div
        className="relative hidden lg:flex flex-col justify-between px-10 py-12 lg:w-[45%] text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B1F6B 0%, #1134A6 60%, #1E3A8A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 my-auto py-8">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-4 border border-white/20">
            Care Team Workspace
          </span>
          <h1
            className="text-3xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Merriweather, Georgia, serif" }}
          >
            Medstar Doctor & Specialist Portal
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-lg">
            Manage your appointment queue, update patient visit details, set custom working availability, and coordinate care smoothly.
          </p>

          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/15">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Default Credentials Format
            </p>
            <p className="text-xs text-white/90 font-mono">
              Name: <span className="font-bold text-yellow-300">Dawit Amare</span>
            </p>
            <p className="text-xs text-white/90 font-mono mt-1">
              Password: <span className="font-bold text-yellow-300">dawitamare@1234</span>
            </p>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">
          Medstar Internal Speciality Clinic · Authorized Medical Staff Portal
        </p>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex flex-col justify-between p-6 lg:p-12">
        <div className="flex justify-end">
          <Link
            href={`/${locale}`}
            className="text-xs text-slate-400 hover:text-ms-blue transition-colors flex items-center gap-1 font-medium"
          >
            ← Back to Main Portal
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md my-auto py-8">
          <div className="mb-8">
            <span className="inline-block rounded-full bg-ms-blue/10 px-3 py-1 text-xs font-bold text-ms-blue mb-3">
              Doctor Sign In
            </span>
            <h2
              className="text-2xl font-bold text-ms-blue"
              style={{ fontFamily: "Merriweather, Georgia, serif" }}
            >
              Welcome back, Doctor
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your doctor name (e.g., Dawit Amare) or email with your assigned password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Doctor Name or Email
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={doctorIdentifier}
                  onChange={(e) => setDoctorIdentifier(e.target.value)}
                  placeholder="e.g. Dawit Amare or dawitamare@medstar.com"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. dawitamare@1234"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ms-blue py-3.5 text-sm font-bold text-white shadow-md hover:bg-ms-blue-mid transition-all disabled:opacity-60"
            >
              {loading ? "Authenticating..." : "Sign In to Doctor Portal →"}
            </button>
          </form>

          {/* Quick preset logins */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Quick Doctor Credentials
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillQuickDoctor("Dawit Amare", "dawitamare@1234")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ms-blue hover:border-ms-blue hover:bg-ms-blue/5 transition-colors text-left"
              >
                Dr. Dawit Amare
                <span className="block text-[10px] text-slate-400 font-normal">
                  dawitamare@1234
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDoctor("Dawit Abebe", "dawitabebe@1234")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ms-blue hover:border-ms-blue hover:bg-ms-blue/5 transition-colors text-left"
              >
                Dr. Dawit Abebe
                <span className="block text-[10px] text-slate-400 font-normal">
                  dawitabebe@1234
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickDoctor("Helen Tadesse", "helentadesse@1234")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ms-blue hover:border-ms-blue hover:bg-ms-blue/5 transition-colors text-left"
              >
                Dr. Helen Tadesse
                <span className="block text-[10px] text-slate-400 font-normal">
                  helentadesse@1234
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Patient booking user?{" "}
          <Link href={`/${locale}/login`} className="font-semibold text-ms-blue hover:underline">
            Patient Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
