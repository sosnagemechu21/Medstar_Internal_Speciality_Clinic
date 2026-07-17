"use client"

import Link from "next/link"
import { useState, useRef, useCallback } from "react"
import { Navbar } from "@/components/ui/navbar"
import { Container } from "@/components/ui/container"
import { ProtectedLink } from "@/components/auth/protected-link"

/* ─── Specialty data ───────────────────────────────────────────────────── */
const specialties = [
  {
    id: "cardiology", name: "Cardiology", doctors: 8,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "neurology", name: "Neurology", doctors: 5,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: "ophthalmology", name: "Ophthalmology", doctors: 6,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: "orthopedics", name: "Orthopedics", doctors: 7,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.5 2.5-1 3.5L17 22H7l2-12.5C8.5 8.5 8 7.5 8 6a4 4 0 0 1 4-4z" />
      </svg>
    ),
  },
  {
    id: "pediatrics", name: "Pediatrics", doctors: 9,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "general", name: "General Medicine", doctors: 12,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
]

/* ─── Stat strip ───────────────────────────────────────────────────────── */
const heroStats = [
  { value: "80+",  label: "SPECIALISTS" },
  { value: "24",   label: "DEPARTMENTS" },
  { value: "45K+", label: "PATIENTS / YR" },
  { value: "98%",  label: "SATISFACTION" },
]

/* ─── Features ─────────────────────────────────────────────────────────── */
const features = [
  {
    id: "booking", title: "Instant Booking",
    body: "Choose your specialist, pick a date from our live calendar, and confirm in under 2 minutes.",
    cta: "Book Now", href: "/book",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "portal", title: "Patient Portal",
    body: "View upcoming appointments, access medical records, and manage your health journey.",
    cta: "Go to Portal", href: "/portal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "payments", title: "Secure Payments",
    body: "Pay via Chapa or Telebirr in ETB. Instant receipts and full payment history.",
    cta: "Learn More", href: "/payments",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

/* ─── Metrics ──────────────────────────────────────────────────────────── */
const metrics = [
  { value: "80+",  label: "Specialist Doctors",  sub: "Across 24 departments" },
  { value: "45K+", label: "Patients Annually",   sub: "Since 2018" },
  { value: "98%",  label: "Satisfaction Rate",   sub: "Verified reviews" },
  { value: "24/7", label: "Emergency Care",       sub: "Always here for you" },
]

/* ══════════════════════════════════════════════════════════════════════════
   Cursor-spotlight hero — tracks mouse position and paints a radial
   gradient "torch" that partially reveals the photo layer beneath the
   blue overlay, matching the effect visible in the reference mockup.
   ══════════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)

  /* Track pointer inside the hero only */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = heroRef.current
    const spot = spotRef.current
    if (!el || !spot) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spot.style.background = `radial-gradient(600px circle at ${x}px ${y}px,
      rgba(255,255,255,0.07) 0%,
      rgba(30,58,138,0.18) 40%,
      transparent 70%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (spotRef.current) spotRef.current.style.background = "transparent"
  }, [])

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden"
      style={{ background: "#0B1F6B" }}
    >
      {/* ── Photo layer — more visible to match reference ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/clinic_lobby_bg.png')",
          opacity: 0.42,
          mixBlendMode: "luminosity",
        }}
        aria-hidden="true"
      />

      {/* ── Navy overlay so photo doesn't overpower ── */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg, rgba(11,31,107,0.82) 50%, rgba(11,31,107,0.55) 100%)" }}
        aria-hidden="true"
      />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />

      {/* ── Cursor spotlight overlay (updated on mousemove) ── */}
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0 z-10 transition-none"
        aria-hidden="true"
      />

      {/* ── Red glow accent top-right ── */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #CC2936 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ── Hero content ── */}
      <Container className="relative z-20 flex flex-col justify-center flex-1 py-20 md:py-28">
        {/* Origin badge */}
        <div className="mb-7 inline-flex">
          <span className="flex items-center gap-2 rounded-full border border-ms-red/60 bg-ms-red/10 px-4 py-1.5 text-[11px] font-bold text-ms-red uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-ms-red animate-pulse" />
            Addis Ababa · Ethiopia · Est. 2018
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-[520px] leading-[1.1] text-white">
          <span className="block text-5xl font-black md:text-6xl lg:text-[68px]">
            Your Health,
          </span>
          <em
            className="block text-5xl md:text-6xl lg:text-[68px] font-bold not-italic text-white"
            style={{ fontFamily: "Merriweather, Georgia, serif", fontStyle: "italic" }}
          >
            Our Speciality
          </em>
        </h1>

        {/* Sub */}
        <p className="mt-6 max-w-sm text-white/65 text-base leading-relaxed">
          World-class specialists. Compassionate care. A clinic built entirely around you.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <ProtectedLink
            href="/book"
            id="hero-book-btn"
            className="group flex items-center gap-2 rounded-full bg-ms-red px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-ms-red-dark hover:scale-[1.04] hover:shadow-ms-red/40 hover:shadow-xl active:scale-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-4 h-4 transition-transform group-hover:rotate-6">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book Appointment
          </ProtectedLink>
          <ProtectedLink
            href="/portal"
            id="hero-portal-btn"
            className="group flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/60"
          >
            Patient Portal
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </ProtectedLink>
        </div>
      </Container>

      {/* ── Stats strip ── */}
      <div className="relative z-20 border-t border-white/10 bg-black/25 backdrop-blur-md">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {heroStats.map((s) => (
              <div key={s.label} className="group py-5 px-6 text-white transition-colors hover:bg-white/5 cursor-default">
                <p className="text-3xl font-black tracking-tight group-hover:text-ms-red transition-colors duration-200">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-widest text-white/45 uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-24 right-8 hidden md:flex flex-col items-center gap-2 text-white/25 text-[10px] tracking-[0.3em] uppercase rotate-90" aria-hidden="true">
        scroll
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Specialty card with magnetic hover: translates toward the cursor inside
   the card bounds.
   ══════════════════════════════════════════════════════════════════════════ */
function SpecialtyCard({ sp }: { sp: typeof specialties[0] }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    card.style.transform = `translate(${dx * 5}px, ${dy * 5}px) scale(1.04)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "translate(0,0) scale(1)"
  }, [])

  return (
    <Link
      ref={cardRef}
      key={sp.id}
      href={`/departments/${sp.id}`}
      id={`specialty-${sp.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm
        hover:shadow-lg hover:border-ms-blue/40 hover:shadow-ms-blue/10
        transition-[box-shadow,border-color] duration-300"
      style={{ willChange: "transform", transition: "transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-ms-blue/60 group-hover:bg-ms-blue group-hover:text-white transition-all duration-300">
        {sp.icon}
      </div>
      <div>
        <p className="text-sm font-bold text-ms-blue">{sp.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sp.doctors} doctors</p>
      </div>
    </Link>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Feature card with subtle tilt-on-hover (CSS perspective)
   ══════════════════════════════════════════════════════════════════════════ */
function FeatureCard({ f }: { f: typeof features[0] }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)"
  }, [])

  return (
    <div
      ref={ref}
      id={`feature-${f.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group rounded-2xl border border-white/10 bg-white/5 p-8 cursor-default"
      style={{ willChange: "transform", transition: "transform 0.12s ease" }}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ms-red/20 text-ms-red group-hover:bg-ms-red group-hover:text-white transition-all duration-300">
        {f.icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
      <p className="text-sm text-white/55 leading-relaxed mb-5">{f.body}</p>
      <ProtectedLink
        href={f.href}
        className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-ms-red hover:underline underline-offset-4"
      >
        {f.cta}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </ProtectedLink>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Home Page
   ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [tab, setTab] = useState<"specialities" | "doctors">("specialities")
  const [search, setSearch] = useState("")

  const filtered = specialties.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── 2. Find the Right Care ───────────────────────────────────── */}
        <section className="bg-[#F4F6FB] py-20">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-ms-blue md:text-4xl">Find the Right Care</h2>
              <p className="mt-2 text-sm text-slate-500">Browse specialities or search for a specific doctor.</p>
            </div>

            {/* Tabs + Search */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                {(["specialities", "doctors"] as const).map((t) => (
                  <button
                    key={t}
                    id={`tab-${t}`}
                    onClick={() => setTab(t)}
                    className={`px-6 py-2.5 text-sm font-semibold capitalize transition-colors duration-150 ${
                      tab === t
                        ? "bg-ms-blue text-white shadow-inner"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  id="search-speciality"
                  type="search"
                  placeholder="Search speciality…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40 transition-shadow"
                />
              </div>
            </div>

            {/* Cards */}
            {tab === "specialities" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {filtered.map((sp) => <SpecialtyCard key={sp.id} sp={sp} />)}
                {filtered.length === 0 && (
                  <p className="col-span-6 py-12 text-center text-sm text-slate-400">No speciality matches "{search}".</p>
                )}
              </div>
            )}

            {tab === "doctors" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-sm shadow-sm">
                Doctor search coming soon — connect via API.
              </div>
            )}
          </Container>
        </section>

        {/* ── 3. Everything In One Place ────────────────────────────────── */}
        <section className="bg-ms-blue py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">Everything You Need, In One Place</h2>
              <p className="mt-3 mx-auto max-w-lg text-sm text-white/55 leading-relaxed">
                From booking to billing — Medstar's digital platform handles it all, securely and simply.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => <FeatureCard key={f.id} f={f} />)}
            </div>
          </Container>
        </section>

        {/* ── 4. Metrics ───────────────────────────────────────────────── */}
        <section className="bg-[#F4F6FB] py-16">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="group rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-md hover:border-ms-blue/30 transition-all duration-300"
                >
                  <p className="text-4xl font-black text-ms-blue group-hover:text-ms-red transition-colors duration-300">
                    {m.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{m.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{m.sub}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── 5. CTA ───────────────────────────────────────────────────── */}
        <section className="bg-ms-navy-dark py-20">
          <Container>
            <div className="text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 uppercase tracking-widest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Appointments available today
              </div>

              <h2 className="mx-auto max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">
                Ready to take charge of your health?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/45 leading-relaxed">
                Book with a specialist in under 2 minutes. No waiting rooms, no paperwork — just care.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <ProtectedLink
                  href="/book"
                  id="cta-book-btn"
                  className="group flex items-center gap-2 rounded-full bg-ms-red px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-ms-red-dark hover:scale-[1.04] hover:shadow-ms-red/40 hover:shadow-xl active:scale-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-4 h-4 transition-transform group-hover:rotate-6">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Book Appointment
                </ProtectedLink>
                <ProtectedLink
                  href="/portal"
                  id="cta-portal-btn"
                  className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/60"
                >
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </ProtectedLink>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 bg-ms-blue py-10">
          <Container>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
              <p>© 2026 Medstar Specialty Clinic. All rights reserved.</p>
              <div className="flex gap-6">
                {["Privacy", "Terms", "Contact"].map((l) => (
                  <Link key={l} href={`/${l.toLowerCase()}`} className="hover:text-white/80 transition-colors">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </>
  )
}
