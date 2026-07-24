"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/providers/auth-provider";

type AuthTab = "signin" | "register";

const stats = [
  { value: "80+", label: "Specialists" },
  { value: "98%", label: "Satisfaction" },
  { value: "45K+", label: "Patients" },
  { value: "24/7", label: "Support" },
];

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] ?? "en";
  const redirect = searchParams.get("redirect") ?? `/${locale}/book`;
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirect);
    }
  }, [authLoading, isAuthenticated, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (tab === "register" && !fullName)) {
      setError("Please fill in all fields.");
      return;
    }

    if (tab === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        await login(email, password);
      } else {
        await register({ email, password, fullName });
      }
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="relative hidden lg:flex flex-col justify-between px-8 py-10 lg:w-[45%] lg:px-14 lg:py-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0B1F6B 0%, #1134A6 60%, #1E3A8A 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex justify-center lg:justify-center">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 my-10 text-center lg:my-0">
          <h1
            className="text-2xl lg:text-3xl font-bold leading-tight mb-3"
            style={{ fontFamily: "Merriweather, Georgia, serif" }}
          >
            Your health journey starts with a single step.
          </h1>
          <p className="mx-auto text-white/65 text-base leading-relaxed max-w-xl">
            Access world-class specialists, manage your appointments, and review your medical history — all from one secure portal.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm px-4 py-3"
              >
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-white/35 tracking-wide">
          256-bit encryption · PCI-DSS compliant · HIPAA aligned
        </p>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex justify-end px-6 pt-6">
          <Link href={`/${locale}`} className="text-sm text-slate-400 hover:text-ms-blue transition-colors">
            ← Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="flex rounded-xl border border-slate-200 p-1 mb-6">
              {(["signin", "register"] as AuthTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    tab === t ? "bg-ms-blue text-white shadow-sm" : "text-slate-500 hover:text-ms-blue"
                  }`}
                >
                  {t === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-ms-blue mb-1">
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {tab === "signin"
                ? "Sign in to access your appointments and health records."
                : "Join thousands of patients managing their care with Medstar."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Abebe Girma"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
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

              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {tab === "signin" && (
                <div className="text-right">
                  <button type="button" className="text-xs text-ms-blue hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-ms-blue py-3.5 text-sm font-bold text-white hover:bg-ms-blue-mid transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
                {!loading && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your data is protected with 256-bit encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
