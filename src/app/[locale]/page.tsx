"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { ProtectedLink } from "@/components/auth/protected-link";
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
    introMissionVision: {
      introductionTitle: "Introduction",
      missionTitle: "Mission",
      visionTitle: "Vision",
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
    introMissionVision: {
      introductionTitle: "መግቢያ",
      missionTitle: "ተልዕኮ",
      visionTitle: "ራዕይ",
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
   blue overlay.
   ══════════════════════════════════════════════════════════════════════════ */
function HeroSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].hero;
  const stats = getHeroStats(locale);
  const heroRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/medstarbg.jpg')",
          opacity: 0.90,
          mixBlendMode: "luminosity",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(11,31,107,0.82) 50%, rgba(11,31,107,0.55) 100%)",
        }}
        aria-hidden="true"
      />

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

      <svg width="0" height="0" className="absolute">
        <filter id="cloth-wave">
          <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.005;0.008;0.005" dur="12s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          WebkitMaskImage: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)",
          maskImage: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)",
        }}
        aria-hidden="true"
      >
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

      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #CC2936 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative z-20 flex flex-col justify-center flex-1 py-20 md:py-28">
        <div className="mb-7 inline-flex">
          <span className="flex items-center gap-2 rounded-full border border-ms-red/60 bg-ms-red/10 px-4 py-1.5 text-[11px] font-bold text-ms-red uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 rounded-full bg-ms-red animate-pulse" />
            {L.origin}
          </span>
        </div>

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

        <p className="mt-6 max-w-sm text-white/65 text-base leading-relaxed">
          {L.sub}
        </p>

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

        <div className="mt-12 md:mt-16 pt-10 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s) => (
              <div
                key={s.label}
                className="group text-white transition-colors cursor-default"
              >
                <p
                  className="text-4xl md:text-5xl font-bold tracking-tight group-hover:text-ms-red transition-colors duration-200"
                  style={{ fontFamily: "Merriweather, Georgia, serif" }}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-xs font-semibold tracking-[0.15em] text-white/60 uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/50 text-[11px] tracking-[0.2em] font-mono"
        aria-hidden="true"
      >
        <span>scroll</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 animate-bounce mt-1"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Intro / Mission / Vision — auto-scrolling carousel (10s per slide)
   ══════════════════════════════════════════════════════════════════════════ */
function IntroMissionVisionSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].introMissionVision;
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: L.introductionTitle,
      icon: "🏥",
      gradient: "from-[#0B1F6B] to-[#1E3A8A]",
      text:
        locale === "am"
          ? "ስሙ እንደሚያመለክተው የውስጥ ህክምና ስፔሻላይዝድ ክሊኒክ ነው። ከውሃ እና መስኖ ሚኒስቴር (ውሃ ልማት) ፊት ለፊት ይገኛል። ክሊኒኩ በባለቤትነት የተያዘ እና ከ15 አመት በላይ ህክምናን በመለማመድ የታወቀ ሀኪም የሚመራ ሲሆን በከፍተኛ ብቃት እና በሚገባ የሰለጠኑ የተለያዩ የትምህርት ዘርፎች ዶክተሮች፣ ነርሶች፣ የላቦራቶሪ ቴክኖሎጂስቶች እና ራዲዮሎጂስቶች እና የራዲዮሎጂ ቴክኒሻኖች የተደገፈ ነው።"
          : "As the name indicates it's an Internal Medicine Specialized clinic. It is located in front of Water & irrigation Ministry (Wuha Lemat). The Clinic is owned and led by a highly reputed physician who has been practicing medicine for more than 15years and supported by highly qualified and well-trained doctors of different disciplines, nurses, Laboratory Technologists and Radiologist and Radiology Technicians. The medical set up is equipped with advanced technology, state of the art medical equipment and furniture imported from aboard and compliant with international standards, to address the growing demands of standard based medical practice.",
    },
    {
      title: L.missionTitle,
      icon: "🎯",
      gradient: "from-[#CC2936] to-[#a81f2a]",
      text:
        locale === "am"
          ? "ከፍተኛ ጥራት ያለው በታካሚ ላይ ያተኮረ፣ በቀላሉ ተደራሽ፣ ወጪ ቆጣቢ እና የምናገለግለውን ማህበረሰብ ፍላጎት የሚያሟላ የጤና እንክብካቤ አቅራቢ መሆን።"
          : "To be a provider of high quality patient-focused health care that is readily accessible, cost effective and meets the needs of the community we serve.",
    },
    {
      title: L.visionTitle,
      icon: "👁️",
      gradient: "from-[#0B1F6B] to-[#CC2936]",
      text:
        locale === "am"
          ? "ለልህቀት ባለው ቁርጠኝነት፣ የታካሚዎችን የሚጠበቀውን በማለፍ፣ ጥራት ያለው የህክምና አገልግሎት በማስፋፋት እና ለተለዋዋጭ የደንበኞች ፍላጎት በምላሽ የማህበረሰባችን የጤና እንክብካቤ መሪ በመሆን ተለይተን እንድንታወቅ።"
          : "To be distinguished as our community's health care leader for its commitment to excellence, exceeding patient expectations through the advancement of quality medical services and its response to changing customer needs.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[#F4F6FB] py-16 md:py-20">
      <Container>
        <div className="relative mx-auto max-w-4xl">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === activeIndex ? "w-8 bg-[#0B1F6B]" : "w-2 bg-slate-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl shadow-xl">
            <div
              className={`bg-gradient-to-br ${current.gradient} p-8 md:p-12`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl md:text-5xl">{current.icon}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {current.title}
                </h2>
              </div>
              <p className="text-sm md:text-base text-white/85 leading-relaxed">
                {current.text}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#CC2936] animate-scroll-progress"
                style={{
                  animationDuration: "10s",
                  animationFillMode: "forwards",
                }}
                key={activeIndex}
              />
            </div>
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {activeIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </Container>
    </section>
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
   Home Page — simplified with clinic summary replacing the directory tabs
   ══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);

  const isAm = locale === "am";

  const summaryText = isAm
    ? "ሜድስታር ስፔሻሊቲ ክሊኒክ ከውሃ እና መስኖ ሚኒስቴር (ውሃ ልማት) ፊት ለፊት የሚገኝ የውስጥ ህክምና ስፔሻላይዝድ ክሊኒክ ነው። ክሊኒኩ ከ15 አመት በላይ ህክምናን በመለማመድ የታወቀ ሀኪም የሚመራ ሲሆን በከፍተኛ ብቃት የሰለጠኑ ዶክተሮች፣ ነርሶች፣ የላቦራቶሪ ቴክኖሎጂስቶች እና ራዲዮሎጂስቶች የተደገፈ ነው። የህክምና አደረጃጀቱ ከውጭ በሚገቡ ዘመናዊ ቴክኖሎጂዎች፣ ከፍተኛ ደረጃ የህክምና መሳሪያዎች እና የቤት እቃዎች የታጠቀ ሲሆን ከአለም አቀፍ ደረጃዎች ጋር የተጣጣመ ነው።"
    : "MedStar Specialty Clinic is an Internal Medicine Specialized clinic located in front of the Water & Irrigation Ministry (Wuha Lemat). The clinic is owned and led by a highly reputed physician with over 15 years of medical practice, supported by highly qualified doctors, nurses, laboratory technologists, and radiologists. Our facility is equipped with advanced technology, state-of-the-art medical equipment, and furniture imported from abroad, compliant with international standards to address the growing demands of standard-based medical practice.";

  const services = isAm
    ? [
        "የልብ ህክምና (Cardiology)",
        "የነርቭ ህክምና (Neurology)",
        "የኩላሊት ህክምና (Nephrology)",
        "የሳንባ ህክምና (Pulmonology)",
        "የሆርሞን ህክምና (Endocrinology)",
        "የምግብ መፈጨት ህክምና (Gastroenterology)",
        "የቆዳ ህክምና (Dermatology)",
        "የሴቶች ህክምና (Gynecology)",
      ]
    : [
        "Cardiology",
        "Neurology",
        "Nephrology",
        "Pulmonology",
        "Endocrinology",
        "Gastroenterology",
        "Dermatology",
        "Gynecology",
      ];

  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <HeroSection locale={locale} />

        {/* ── 2. Introduction / Mission / Vision ────────────────────────── */}
        <IntroMissionVisionSection locale={locale} />

        {/* ── 3. Why Choose MedStar — Clinic Summary ────────────────────── */}
        <section id="directory" className="bg-[#F4F6FB] py-20">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-ms-blue md:text-4xl">
                {t[locale as keyof typeof t].whyChooseUs.title}
              </h2>
              <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
                {t[locale as keyof typeof t].whyChooseUs.sub}
              </p>
            </div>

            {/* Summary Card */}
            <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0B1F6B] to-[#1E3A8A] p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🏥</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {isAm ? "ስለ ሜድስታር ክሊኒክ" : "About MedStar Clinic"}
                  </h3>
                </div>
                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  {summaryText}
                </p>
              </div>

              <div className="p-8 md:p-10">
                <h4 className="text-lg font-bold text-ms-blue mb-5 flex items-center gap-2">
                  <span>🩺</span>
                  {isAm ? "የእኛ አገልግሎቶች" : "Our Specialties"}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {services.map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-ms-blue/5 hover:border-ms-blue/20 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-ms-red shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📍</span>
                      <div>
                        <p className="font-semibold text-slate-700">{isAm ? "አድራሻ" : "Location"}</p>
                        <p className="text-slate-500 mt-0.5">
                          {isAm ? "22 ማዞሪያ ከውሃ ልማት ፊት ለፊት" : "22 Mazoria, in front of Water & Irrigation Ministry"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">📞</span>
                      <div>
                        <p className="font-semibold text-slate-700">{isAm ? "ስልክ" : "Phone"}</p>
                        <p className="text-slate-500 mt-0.5">011-635-42-80 / 0975-704070</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⏰</span>
                      <div>
                        <p className="font-semibold text-slate-700">{isAm ? "ሰዓታት" : "Hours"}</p>
                        <p className="text-slate-500 mt-0.5">{isAm ? "24/7 ክፍት ነው" : "Open 24/7"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── 4. Everything In One Place ────────────────────────────────── */}
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

        {/* ── 5. Metrics ───────────────────────────────────────────────── */}
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

        {/* ── 6. CTA ───────────────────────────────────────────────────── */}
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

