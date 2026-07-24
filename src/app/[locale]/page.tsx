"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useDeferredValue, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { ProtectedLink } from "@/components/auth/protected-link";
import { fetchDoctors, fetchSpecialties, type DoctorListItem, type SpecialtyListItem } from "@/lib/catalog-api";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath } from "@/lib/locale-routing";
import type { Locale } from "../../../i18n.config";

const t = {
  en: {
    hero: {
      origin: "Addis Ababa · Ethiopia · Est. 2018",
      headline1: "Your Health,",
      headline2: "Our Speciality",
      sub: "World-class specialists. Compassionate care. A clinic built entirely around you.",
      bookAppointment: "Book Appointment",
      patientPortal: "Patient Portal",
      scroll: "scroll"
    },
    directory: {
      title: "Find the Right Care",
      sub: "Browse specialities or search for a specific doctor.",
      tabSpecialities: "Specialities",
      tabDoctors: "Doctors",
      searchSpeciality: "Search speciality…",
      searchBoth: "Search doctor or speciality…",
      loadingSpecialities: "Loading specialties…",
      loadingDoctors: "Loading doctors…",
      error: "Unable to load doctor and specialty listings right now.",
      noSpeciality: 'No speciality matches',
      noDoctors: 'No doctors match',
      doctorsCount: "doctors",
      book: "Book"
    },
    whyChooseUs: {
      title: "Why Choose MedStar",
      sub: "We combine international medical standards with Ethiopian hospitality.",
    },
    everything: {
      title: "Everything You Need, In One Place",
      sub: "From booking to billing — Medstar's digital platform handles it all, securely and simply.",
    },
    cta: {
      badge: "Appointments available today",
      title: "Ready to take charge of your health?",
      sub: "Book with a specialist in under 2 minutes. No waiting rooms, no paperwork — just care.",
      book: "Book Appointment",
      signIn: "Sign In",
    },
    footer: {
      copyright: "© 2026 Medstar Specialty Clinic. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    }
  },
  am: {
    hero: {
      origin: "አዲስ አበባ · ኢትዮጵያ · ከ 2010 ዓ.ም ጀምሮ",
      headline1: "ጤናዎ፣",
      headline2: "የእኛ ልዩ ሙያ",
      sub: "አለም አቀፍ ደረጃቸውን የጠበቁ ስፔሻሊስቶች። ሩህሩህ እንክብካቤ። ሙሉ በሙሉ በእርስዎ ዙሪያ የተገነባ ክሊኒክ።",
      bookAppointment: "ቀጠሮ ይያዙ",
      patientPortal: "የታካሚ ፖርታል",
      scroll: "ወደ ታች"
    },
    directory: {
      title: "ትክክለኛውን እንክብካቤ ያግኙ",
      sub: "ስፔሻሊቲዎችን ያስሱ ወይም የተወሰነ ዶክተር ይፈልጉ።",
      tabSpecialities: "ስፔሻሊቲዎች",
      tabDoctors: "ዶክተሮች",
      searchSpeciality: "ስፔሻሊቲ ይፈልጉ…",
      searchBoth: "ዶክተር ወይም ስፔሻሊቲ ይፈልጉ…",
      loadingSpecialities: "ስፔሻሊቲዎችን በመጫን ላይ…",
      loadingDoctors: "ዶክተሮችን በመጫን ላይ…",
      error: "በአሁኑ ጊዜ የዶክተር እና የስፔሻሊቲ ዝርዝሮችን መጫን አልተቻለም።",
      noSpeciality: 'ምንም ስፔሻሊቲ አይገኝም ለ',
      noDoctors: 'ምንም ዶክተር አይገኝም ለ',
      doctorsCount: "ዶክተሮች",
      book: "ይያዙ"
    },
    whyChooseUs: {
      title: "ለምን ሜድስታርን ይመርጣሉ",
      sub: "ዓለም አቀፍ የሕክምና ደረጃዎችን ከኢትዮጵያዊ መስተንግዶ ጋር እናጣምራለን።",
    },
    everything: {
      title: "የሚፈልጉት ሁሉ በአንድ ቦታ",
      sub: "ከቀጠሮ እስከ ክፍያ — የሜድስታር ዲጂታል መድረክ ሁሉንም በደህንነት እና በቀላል ያስተናግዳል።",
    },
    cta: {
      badge: "ለዛሬ ቀጠሮዎች አሉ።",
      title: "የጤናዎን ሃላፊነት ለመውሰድ ዝግጁ ነዎት?",
      sub: "ከ 2 ደቂቃ ባነሰ ጊዜ ውስጥ ከስፔሻሊስት ጋር ቀጠሮ ይያዙ። ምንም የጥበቃ ክፍሎች የሉም፣ ምንም ወረቀት የለም — እንክብካቤ ብቻ።",
      book: "ቀጠሮ ይያዙ",
      signIn: "ግባ",
    },
    footer: {
      copyright: "© 2026 የሜድስታር ስፔሻሊቲ ክሊኒክ። መብቱ በህግ የተጠበቀ ነው።",
      privacy: "ግላዊነት",
      terms: "ውሎች",
      contact: "አግኙን",
    }
  }
} as const;

const specialtyIcons: Record<string, string> = {
  cardiology: "❤️",
  dermatology: "✨",
  general: "🩺",
  neurology: "🧠",
  ophthalmology: "👁️",
  orthopedics: "🦴",
  pediatrics: "👶",
};

function getSpecialtyIcon(name: string): string {
  const key = name.toLowerCase().split(/\s+/)[0];
  return specialtyIcons[key] || "🩺";
}

/* ─── Stat strip ───────────────────────────────────────────────────────── */
const getHeroStats = (locale: Locale) => locale === "am" ? [
  { value: "80+", label: "ስፔሻሊስቶች" },
  { value: "24", label: "ክፍሎች" },
  { value: "45K+", label: "ታካሚዎች / በዓመት" },
  { value: "98%", label: "እርካታ" },
] : [
  { value: "80+", label: "SPECIALISTS" },
  { value: "24", label: "DEPARTMENTS" },
  { value: "45K+", label: "PATIENTS / YR" },
  { value: "98%", label: "SATISFACTION" },
];

/* ─── Features ─────────────────────────────────────────────────────────── */
const getFeatures = (locale: Locale) => {
  const isAm = locale === "am";
  return [
    {
      id: "booking",
      title: isAm ? "ፈጣን ቀጠሮ ማረጋገጫ" : "Instant Booking",
      body: isAm ? "ስፔሻሊስትዎን ይምረጡ፣ ከቀን መቁጠሪያችን ቀን ይምረጡ እና ከ 2 ደቂቃ ባነሰ ጊዜ ውስጥ ያረጋግጡ።" : "Choose your specialist, pick a date from our live calendar, and confirm in under 2 minutes.",
      cta: isAm ? "አሁን ቀጠሮ ይያዙ" : "Book Now",
      href: "/book",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "portal",
      title: isAm ? "የታካሚ ፖርታል" : "Patient Portal",
      body: isAm ? "የሚመጡ ቀጠሮዎችን ይመልከቱ፣ የህክምና መዝገቦችን ይድረሱ እና የጤና ጉዞዎን ያስተዳድሩ።" : "View upcoming appointments, access medical records, and manage your health journey.",
      cta: isAm ? "ወደ ፖርታል ይሂዱ" : "Go to Portal",
      href: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: "payments",
      title: isAm ? "ደህንነቱ የተጠበቀ ክፍያ" : "Secure Payments",
      body: isAm ? "በቻፓ ወይም በቴሌብር በብር ይክፈሉ። ፈጣን ደረሰኞች እና ሙሉ የክፍያ ታሪክ።" : "Pay via Chapa or Telebirr in ETB. Instant receipts and full payment history.",
      cta: isAm ? "ተጨማሪ ይወቁ" : "Learn More",
      href: "/payments",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];
};

/* ─── Metrics ──────────────────────────────────────────────────────────── */
const getMetrics = (locale: Locale) => locale === "am" ? [
  { value: "80+", label: "ስፔሻሊስት ዶክተሮች", sub: "በ 24 ክፍሎች" },
  { value: "45K+", label: "ታካሚዎች በዓመት", sub: "ከ 2010 ዓ.ም ጀምሮ" },
  { value: "98%", label: "የእርካታ መጠን", sub: "የተረጋገጡ ግምገማዎች" },
  { value: "24/7", label: "የድንገተኛ አደጋ እንክብካቤ", sub: "ሁልጊዜ ለእርስዎ እዚህ ነን" },
] : [
  { value: "80+", label: "Specialist Doctors", sub: "Across 24 departments" },
  { value: "45K+", label: "Patients Annually", sub: "Since 2018" },
  { value: "98%", label: "Satisfaction Rate", sub: "Verified reviews" },
  { value: "24/7", label: "Emergency Care", sub: "Always here for you" },
];

/* ══════════════════════════════════════════════════════════════════════════
   Cursor-spotlight hero — tracks mouse position and paints a radial
   gradient "torch" that partially reveals the photo layer beneath the
   blue overlay, matching the effect visible in the reference mockup.
   ══════════════════════════════════════════════════════════════════════════ */
function HeroSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].hero;
  const stats = getHeroStats(locale);
  const heroRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* Track pointer inside the hero only */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    const spot = spotRef.current;
    const grid = gridRef.current;
    if (!el || !spot) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    spot.style.setProperty('--mouse-x', `${x}px`);
    spot.style.setProperty('--mouse-y', `${y}px`);

    if (grid) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Parallax tilt based on mouse to enhance the cloth feel
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      grid.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    }
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="group relative min-h-[92vh] flex flex-col justify-between overflow-hidden"
      style={{ background: "#0B1F6B" }}
    >
      {/* ── Photo layer — more visible to match reference ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/medstarbg.jpg')",
          opacity: 0.90,
          mixBlendMode: "luminosity",
        }}
        aria-hidden="true"
      />

      {/* ── Navy overlay so photo doesn't overpower ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(11,31,107,0.82) 50%, rgba(11,31,107,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Base faint dot grid (always visible) ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* ── SVG Filter for Cloth Wave ── */}
      <svg width="0" height="0" className="absolute">
        <filter id="cloth-wave">
          <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.005;0.008;0.005" dur="12s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* ── Cursor spotlight wrapper ── */}
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          WebkitMaskImage: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)",
          maskImage: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)",
        }}
        aria-hidden="true"
      >
        {/* ── The animated/tilted fabric grid ── */}
        <div
          ref={gridRef}
          className="absolute inset-[-10%] w-[120%] h-[120%]"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, rgba(255,255,255,1) 2px, transparent 2px),
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            backgroundPosition: "40px 40px, 0 0, 0 0",
            transition: "transform 0.15s ease-out",
            filter: "url(#cloth-wave)",
          }}
        />
      </div>

      {/* ── Red glow accent top-right ── */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #CC2936 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Hero content ── */}
      <Container className="relative z-20 flex flex-col justify-center flex-1 py-20 md:py-28">
        {/* Origin badge */}
        <div className="mb-7 inline-flex">
          <span className="flex items-center gap-2 rounded-full border border-ms-red/60 bg-ms-red/10 px-4 py-1.5 text-[11px] font-bold text-ms-red uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-ms-red animate-pulse" />
            {L.origin}
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-[520px] leading-[1.1] text-white">
          <span className="block text-5xl font-black md:text-6xl lg:text-[68px]">
            {L.headline1}
          </span>
          <em
            className="block text-5xl md:text-6xl lg:text-[68px] font-bold not-italic text-white"
            style={{
              fontFamily: "Merriweather, Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {L.headline2}
          </em>
        </h1>

        {/* Sub */}
        <p className="mt-6 max-w-sm text-white/65 text-base leading-relaxed">
          {L.sub}
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <ProtectedLink
            href="/book"
            id="hero-book-btn"
            className="group flex items-center gap-2 rounded-full bg-ms-red px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-ms-red-dark hover:scale-[1.04] hover:shadow-ms-red/40 hover:shadow-xl active:scale-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-4 h-4 transition-transform group-hover:rotate-6"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {L.bookAppointment}
          </ProtectedLink>
          <ProtectedLink
            href="/dashboard"
            id="hero-portal-btn"
            className="group flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/60"
          >
            {L.patientPortal}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </ProtectedLink>
        </div>
      </Container>

      {/* ── Stats strip ── */}
      <div className="relative z-20 border-t border-white/10 bg-black/25 backdrop-blur-md">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="group py-5 px-6 text-white transition-colors hover:bg-white/5 cursor-default"
              >
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
      <div
        className="pointer-events-none absolute bottom-24 right-8 hidden md:flex flex-col items-center gap-2 text-white/25 text-[10px] tracking-[0.3em] uppercase rotate-90"
        aria-hidden="true"
      >
        {L.scroll}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Specialty card with magnetic hover: translates toward the cursor inside
   the card bounds.
   ══════════════════════════════════════════════════════════════════════════ */
function SpecialtyCard({ sp, locale }: { sp: SpecialtyListItem; locale: Locale }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translate(${dx * 5}px, ${dy * 5}px) scale(1.04)`;
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "translate(0,0) scale(1)";
  }, []);

  return (
    <Link
      ref={cardRef}
      key={sp.id}
      href={getLocalizedPath(locale, `/departments/${sp.id}`)}
      id={`specialty-${sp.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm
        hover:shadow-lg hover:border-ms-blue/40 hover:shadow-ms-blue/10
        transition-[box-shadow,border-color] duration-300"
      style={{
        willChange: "transform",
        transition:
          "transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-ms-blue/60 group-hover:bg-ms-blue group-hover:text-white transition-all duration-300">
        <span className="text-2xl leading-none">{getSpecialtyIcon(sp.name)}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-ms-blue">{sp.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sp.doctorCount} {t[locale as keyof typeof t].directory.doctorsCount}</p>
      </div>
    </Link>
  );
}

function HomeDoctorCard({ doctor, locale }: { doctor: DoctorListItem; locale: Locale }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-ms-blue/40 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ms-blue/10 text-lg">👨‍⚕️</div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ms-blue">{doctor.name}</p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-ms-red/80">{doctor.title}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {doctor.bio || doctor.specialty.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">{doctor.specialty.name}</span>
        <ProtectedLink
          href={getLocalizedPath(locale, "/book")}
          className="rounded-full bg-ms-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-ms-blue-mid"
        >
          {t[locale as keyof typeof t].directory.book}
        </ProtectedLink>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Feature card with subtle tilt-on-hover (CSS perspective)
   ══════════════════════════════════════════════════════════════════════════ */
function FeatureCard({ f }: { f: ReturnType<typeof getFeatures>[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);

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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </ProtectedLink>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Home Page
   ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const [tab, setTab] = useState<"specialities" | "doctors">("specialities");
  const [search, setSearch] = useState("");
  const [specialties, setSpecialties] = useState<SpecialtyListItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "doctors" || tabParam === "specialities") {
      setTab(tabParam);
      // Wait for rendering to complete, then scroll smoothly
      const timer = setTimeout(() => {
        const element = document.getElementById("directory");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        setCatalogError(null);

        const [nextSpecialties, nextDoctors] = await Promise.all([
          fetchSpecialties(locale, controller.signal),
          fetchDoctors(locale, { signal: controller.signal }),
        ]);

        setSpecialties(nextSpecialties);
        setDoctors(nextDoctors);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setCatalogError("Unable to load doctor and specialty listings right now.");
      } finally {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [locale]);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const L = t[locale as keyof typeof t].directory;

  const filteredSpecialties = specialties.filter((specialty) =>
    `${specialty.name} ${specialty.description}`.toLowerCase().includes(normalizedSearch),
  );
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.title} ${doctor.specialty.name} ${doctor.bio}`.toLowerCase().includes(normalizedSearch),
  );

  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <HeroSection locale={locale} />

        {/* ── 2. Find the Right Care ───────────────────────────────────── */}
        <section id="directory" className="bg-[#F4F6FB] py-20">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-ms-blue md:text-4xl">
                {t[locale as keyof typeof t].whyChooseUs.title}
              </h2>
              <p className="mt-3 text-slate-500">
                {t[locale as keyof typeof t].whyChooseUs.sub}
              </p>
            </div>

            {/* Tabs + Search */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                {(["specialities", "doctors"] as const).map((tId) => (
                  <button
                    key={tId}
                    id={`tab-${tId}`}
                    onClick={() => setTab(tId)}
                    className={`px-6 py-2.5 text-sm font-semibold capitalize transition-colors duration-150 ${
                      tab === tId
                        ? "bg-ms-blue text-white shadow-inner"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tId === "specialities" ? L.tabSpecialities : L.tabDoctors}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  id="search-speciality"
                  type="search"
                  placeholder={tab === "specialities" ? L.searchSpeciality : L.searchBoth}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40 transition-shadow"
                />
              </div>
            </div>

            {/* Cards */}
            {tab === "specialities" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {catalogLoading && (
                  <div className="col-span-6 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
                    {L.loadingSpecialities}
                  </div>
                )}
                {!catalogLoading && catalogError && (
                  <div className="col-span-6 rounded-2xl border border-red-100 bg-red-50 p-12 text-center text-sm text-red-600 shadow-sm">
                    {L.error}
                  </div>
                )}
                {!catalogLoading && !catalogError && filteredSpecialties.map((sp) => (
                  <SpecialtyCard key={sp.id} sp={sp} locale={locale} />
                ))}
                {!catalogLoading && !catalogError && filteredSpecialties.length === 0 && (
                  <p className="col-span-6 py-12 text-center text-sm text-slate-400">
                    {L.noSpeciality} "{search}".
                  </p>
                )}
              </div>
            )}

            {tab === "doctors" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {catalogLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm lg:col-span-2">
                    {L.loadingDoctors}
                  </div>
                )}
                {!catalogLoading && catalogError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-12 text-center text-sm text-red-600 shadow-sm lg:col-span-2">
                    {L.error}
                  </div>
                )}
                {!catalogLoading && !catalogError && filteredDoctors.map((doctor) => (
                  <HomeDoctorCard key={doctor.id} doctor={doctor} locale={locale} />
                ))}
                {!catalogLoading && !catalogError && filteredDoctors.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm lg:col-span-2">
                    {L.noDoctors} "{search}".
                  </div>
                )}
              </div>
            )}
          </Container>
        </section>

        {/* ── 3. Everything In One Place ────────────────────────────────── */}
        <section className="bg-ms-blue py-20">
          <Container>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                {t[locale as keyof typeof t].everything.title}
              </h2>
              <p className="mt-3 mx-auto max-w-lg text-sm text-white/55 leading-relaxed">
                {t[locale as keyof typeof t].everything.sub}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {getFeatures(locale).map((f) => (
                <FeatureCard key={f.id} f={{ ...f, href: getLocalizedPath(locale, f.href) }} />
              ))}
            </div>
          </Container>
        </section>

        {/* ── 4. Metrics ───────────────────────────────────────────────── */}
        <section className="bg-[#F4F6FB] py-16">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getMetrics(locale).map((m) => (
                <div
                  key={m.label}
                  className="group rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm hover:shadow-md hover:border-ms-blue/30 transition-all duration-300"
                >
                  <p className="text-4xl font-black text-ms-blue group-hover:text-ms-red transition-colors duration-300">
                    {m.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {m.label}
                  </p>
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t[locale as keyof typeof t].cta.badge}
              </div>

              <h2 className="mx-auto max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">
                {t[locale as keyof typeof t].cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/45 leading-relaxed">
                {t[locale as keyof typeof t].cta.sub}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <ProtectedLink
                  href={getLocalizedPath(locale, "/book")}
                  id="cta-book-btn"
                  className="group flex items-center gap-2 rounded-full bg-ms-red px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-ms-red-dark hover:scale-[1.04] hover:shadow-ms-red/40 hover:shadow-xl active:scale-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    className="w-4 h-4 transition-transform group-hover:rotate-6"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {t[locale as keyof typeof t].cta.book}
                </ProtectedLink>
                <ProtectedLink
                  href={getLocalizedPath(locale, "/dashboard")}
                  id="cta-portal-btn"
                  className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/60"
                >
                  {t[locale as keyof typeof t].cta.signIn}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  >
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
              <p>{t[locale as keyof typeof t].footer.copyright}</p>
              <div className="flex gap-6">
                <Link
                  href={getLocalizedPath(locale, `/privacy`)}
                  className="hover:text-white/80 transition-colors"
                >
                  {t[locale as keyof typeof t].footer.privacy}
                </Link>
                <Link
                  href={getLocalizedPath(locale, `/terms`)}
                  className="hover:text-white/80 transition-colors"
                >
                  {t[locale as keyof typeof t].footer.terms}
                </Link>
                <Link
                  href={getLocalizedPath(locale, `/contact`)}
                  className="hover:text-white/80 transition-colors"
                >
                  {t[locale as keyof typeof t].footer.contact}
                </Link>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </>
  );
}
