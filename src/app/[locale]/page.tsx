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
      headline1: "Your Health,",
      headline2: "Our Speciality",
      sub: "World-class specialists. Compassionate care. A clinic built entirely around you.",
      bookAppointment: "Book Appointment",
      patientPortal: "Patient Portal",
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
    visit: {
      title: "Visit Our Clinic",
      addressLabel: "Address",
      addressVal: "22, from Golagol Building 150 m\nAddis Ababa, Ethiopia",
      phoneLabel: "Phone",
      telegramLabel: "Telegram",
      openMap: "Open In Google Maps",
    },
    footer: {
      tagline: "Advanced specialty care with a human touch. Serving Addis Ababa since 2018.",
      specialtiesTitle: "Specialities",
      quickLinksTitle: "Quick Links",
      contactTitle: "Contact",
      address: "22, from Golagol Building 150 m, Addis Ababa, Ethiopia",
      phone: "+251 11 635 4280",
      email: "info@medstarclinic.et",
      copyright: "© 2026 Medstar Specialty Clinic. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    },
  },
  am: {
    hero: {
      headline1: "ጤናዎ፣",
      headline2: "የእኛ ልዩ ሙያ",
      sub: "አለም አቀፍ ደረጃቸውን የጠበቁ ስፔሻሊስቶች። ሩህሩህ እንክብካቤ። ሙሉ በሙሉ በእርስዎ ዙሪያ የተገነባ ክሊኒክ።",
      bookAppointment: "ቀጠሮ ይያዙ",
      patientPortal: "የታካሚ ፖርታል",
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
    visit: {
      title: "ክሊኒካችንን ይጎብኙ",
      addressLabel: "አድራሻ",
      addressVal: "22 ማዞሪያ ከጎላጎል ህንፃ 150 ሜትር\nአዲስ አበባ፣ ኢትዮጵያ",
      phoneLabel: "ስልክ",
      telegramLabel: "ቴሌግራም",
      openMap: "በጎግል ካርታ ክፈት",
    },
    footer: {
      tagline: "በሰብአዊ ስሜት የተደገፈ የላቀ የህክምና አገልግሎት። ከ 2010 ዓ.ም ጀምሮ አዲስ አበባን እያገለገልን ይገኛል።",
      specialtiesTitle: "ልዩ ሙያዎች",
      quickLinksTitle: "ፈጣን አገናኞች",
      contactTitle: "አግኙን",
      address: "22 ማዞሪያ ከጎላጎል ህንፃ 150 ሜትር፣ አዲስ አበባ፣ ኢትዮጵያ",
      phone: "+251 11 635 4280",
      email: "info@medstarclinic.et",
      copyright: "© 2026 የሜድስታር ስፔሻሊቲ ክሊኒክ። መብቱ በህግ የተጠበቀ ነው።",
      privacy: "ግላዊነት",
      terms: "ውሎች",
      contact: "አግኙን",
    },
  },
} as const;

const getHeroStats = (locale: Locale) =>
  locale === "am"
    ? [
        { value: "80+", label: "ስፔሻሊስቶች" },
        { value: "24", label: "ክፍሎች" },
        { value: "45K+", label: "ታካሚዎች / በዓመት" },
        { value: "98%", label: "እርካታ" },
      ]
    : [
        { value: "80+", label: "SPECIALISTS" },
        { value: "24", label: "DEPARTMENTS" },
        { value: "45K+", label: "PATIENTS / YR" },
        { value: "98%", label: "SATISFACTION" },
      ];

const getFeatures = (locale: Locale) => {
  const isAm = locale === "am";
  return [
    {
      id: "booking",
      title: isAm ? "ፈጣን ቀጠሮ ማረጋገጫ" : "Instant Booking",
      body: isAm
        ? "ስፔሻሊስትዎን ይምረጡ፣ ከቀን መቁጠሪያችን ቀን ይምረጡ እና ከ 2 ደቂቃ ባነሰ ጊዜ ውስጥ ያረጋግጡ።"
        : "Choose your specialist, pick a date from our live calendar, and confirm in under 2 minutes.",
      cta: isAm ? "አሁን ቀጠሮ ይያዙ" : "Book Now",
      href: "/book",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
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
      body: isAm
        ? "የሚመጡ ቀጠሮዎችን ይመልከቱ፣ የህክምና መዝገቦችን ይድረሱ እና የጤና ጉዞዎን ያስተዳድሩ።"
        : "View upcoming appointments, access medical records, and manage your health journey.",
      cta: isAm ? "ወደ ፖርታል ይሂዱ" : "Go to Portal",
      href: "/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: "payments",
      title: isAm ? "ደህንነቱ የተጠበቀ ክፍያ" : "Secure Payments",
      body: isAm
        ? "በቻፓ ወይም በቴሌብር በብር ይክፈሉ። ፈጣን ደረሰኞች እና ሙሉ የክፍያ ታሪክ።"
        : "Pay via Chapa or Telebirr in ETB. Instant receipts and full payment history.",
      cta: isAm ? "ተጨማሪ ይወቁ" : "Learn More",
      href: "/payments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];
};

const getMetrics = (locale: Locale) =>
  locale === "am"
    ? [
        { value: "80+", label: "ስፔሻሊስት ዶክተሮች", sub: "በ 24 ክፍሎች" },
        { value: "45K+", label: "ታካሚዎች በዓመት", sub: "ከ 2010 ዓ.ም ጀምሮ" },
        { value: "98%", label: "የእርካታ መጠን", sub: "የተረጋገጡ ግምገማዎች" },
        { value: "24/7", label: "የድንገተኛ አደጋ እንክብካቤ", sub: "ሁልጊዜ ለእርስዎ እዚህ ነን" },
      ]
    : [
        { value: "80+", label: "Specialist Doctors", sub: "Across 24 departments" },
        { value: "45K+", label: "Patients Annually", sub: "Since 2018" },
        { value: "98%", label: "Satisfaction Rate", sub: "Verified reviews" },
        { value: "24/7", label: "Emergency Care", sub: "Always here for you" },
      ];

function HeroSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].hero;
  const stats = getHeroStats(locale);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#0B1F6B]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/medstarbg.jpg')", mixBlendMode: "luminosity" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg, rgba(11,31,107,0.85) 40%, rgba(7,19,59,0.7) 100%)" }}
        aria-hidden="true"
      />
<Container className="relative z-20 flex flex-col justify-center flex-1 py-20 md:py-28">
        <h1 className="max-w-[600px] leading-[1.08] text-white tracking-tight">
          <span className="block text-5xl font-extrabold md:text-6xl lg:text-7xl">{L.headline1}</span>
          <em className="block text-5xl md:text-6xl lg:text-7xl font-bold not-italic text-white mt-1" style={{ fontFamily: "Merriweather, Georgia, serif", fontStyle: "italic" }}>
            {L.headline2}
          </em>
        </h1>
        <p className="mt-6 max-w-lg text-white/75 text-base md:text-lg leading-relaxed font-light">
          {L.sub}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ProtectedLink href="/book" className="flex items-center gap-2.5 rounded-full bg-ms-red px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-ms-red-dark hover:scale-105 transition-all duration-300">
            {L.bookAppointment}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </ProtectedLink>
          <ProtectedLink href="/dashboard" className="flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300">
            {L.patientPortal}
          </ProtectedLink>
        </div>
        <div className="mt-16 md:mt-20 pt-10 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((s) => (
              <div key={s.label} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all">
                <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-white group-hover:text-ms-red transition-colors" style={{ fontFamily: "Merriweather, Georgia, serif" }}>
                  {s.value}
                </p>
                <p className="mt-2 text-xs font-bold tracking-widest text-white/60 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function DoctorIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Halo / glow */}
      <circle cx="100" cy="100" r="92" fill="url(#halo)" />
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CC2936" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#CC2936" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* shoulders */}
      <path d="M60 172c8-26 28-34 40-34s32 8 40 34" fill="#1E3A8A" />
      {/* neck */}
      <rect x="88" y="98" width="24" height="22" rx="10" fill="#E8B88A" />
      {/* head */}
      <circle cx="100" cy="78" r="34" fill="#F2C79B" />
      {/* hair */}
      <path d="M66 80c0-26 15-44 34-44s34 18 34 44c-8-14-20-20-34-20s-26 6-34 20z" fill="#2B2B3A" />
      {/* eyes */}
      <circle cx="88" cy="80" r="4" fill="#1F2937" />
      <circle cx="112" cy="80" r="4" fill="#1F2937" />
      <circle cx="89" cy="79" r="1.4" fill="#fff" />
      <circle cx="113" cy="79" r="1.4" fill="#fff" />
      {/* smile */}
      <path d="M92 92c4 3 12 3 16 0" stroke="#B4693A" strokeWidth="2.4" strokeLinecap="round" />
      {/* blush */}
      <circle cx="82" cy="88" r="5" fill="#F4A2A2" opacity="0.6" />
      <circle cx="118" cy="88" r="5" fill="#F4A2A2" opacity="0.6" />
      {/* stethoscope */}
      <path d="M100 106v10M100 110c-8 0-12-5-12-12M100 110c8 0 12-5 12-12" stroke="#CC2936" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="90" r="6" stroke="#CC2936" strokeWidth="3" fill="none" />
    </svg>
  );
}

function IntroMissionVisionSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].introMissionVision;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const slides = [
    {
      id: "intro",
      icon: "🏥",
      number: "01",
      title: L.introductionTitle,
      accent: "#CC2936",
      text: locale === "am"
        ? "ስሙ እንደሚያመለክተው የውስጥ ህክምና ስፔሻላይዝድ ክሊኒክ ነው። ከውሃ እና መስኖ ሚኒስቴር (ውሃ ልማት) ፊት ለፊት ይገኛል።"
        : "As the name indicates it's an Internal Medicine Specialized clinic located in front of Water & irrigation Ministry, equipped with advanced international-standard medical devices.",
    },
    {
      id: "mission",
      icon: "🎯",
      number: "02",
      title: L.missionTitle,
      accent: "#E11D48",
      text: locale === "am"
        ? "ከፍተኛ ጥራት ያለው በታካሚ ላይ ያተኮረ፣ በቀላሉ ተደራሽ፣ ወጪ ቆጣቢ እና የምናገለግለውን ማህበረሰብ ፍላጎት የሚያሟላ የጤና እንክብካቤ አቅራቢ መሆን።"
        : "To be a provider of high quality patient-focused health care that is readily accessible, cost effective and meets the needs of the community we serve.",
    },
    {
      id: "vision",
      icon: "👁️",
      number: "03",
      title: L.visionTitle,
      accent: "#2563EB",
      text: locale === "am"
        ? "ለልህቀት ባለው ቁርጠኝነት፣ የታካሚዎችን የሚጠበቀውን በማለፍ፣ ጥራት ያለው የህክምና አገልግሎት በማስፋፋት የህብረተሰባችን የጤና እንክብካቤ መሪ መሆን።"
        : "To be distinguished as our community's health care leader for its commitment to excellence, exceeding patient expectations through quality services.",
    },
  ];

  const handleNext = useCallback(() => {
    setDirection("next");
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setDirection("prev");
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleSelect = (index: number) => {
    setDirection(index > activeIndex ? "next" : "prev");
    setActiveIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const current = slides[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] py-24 text-white">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-ms-red/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-ms-blue/30 blur-3xl" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Interactive Header & Tabs */}
          <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ms-red animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                Interactive Showcase
              </span>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 sm:gap-3 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
              {slides.map((s, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
                      active
                        ? "bg-ms-red text-white shadow-lg shadow-ms-red/30 scale-105"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{s.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-white/40 font-bold">
              {current.number} / 03
            </div>
          </div>

          {/* Interactive Motion Card */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="group relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-white/25"
          >
            {/* Top 5-second progress line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-30">
              <div
                key={`${activeIndex}-${isPaused}`}
                className="h-full bg-gradient-to-r from-ms-red to-rose-400 transition-all"
                style={{
                  animation: isPaused ? "none" : "progress5s 5s linear infinite",
                }}
              />
            </div>

            <div className="grid md:grid-cols-5 gap-0 min-h-[340px]">
              {/* Illustration side */}
              <div className="relative md:col-span-2 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent p-10 overflow-hidden">
                <div className="relative z-10 h-56 w-56 sm:h-64 sm:w-64 transition-transform duration-700 ease-out group-hover:scale-105">
                  <DoctorIllustration />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,41,54,0.22),transparent_70%)]" />
                <span className="absolute bottom-4 left-6 text-[10px] font-mono tracking-widest text-white/30 uppercase">
                  Medstar Specialty Clinic
                </span>
              </div>

              {/* Text side with direction motion */}
              <div
                key={activeIndex}
                className={`relative md:col-span-3 p-8 md:p-12 flex flex-col justify-between transition-all duration-500 ${
                  direction === "next"
                    ? "animate-[slideInRight_0.45s_cubic-bezier(0.16,1,0.3,1)]"
                    : "animate-[slideInLeft_0.45s_cubic-bezier(0.16,1,0.3,1)]"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl shadow-inner border border-white/10">
                        {current.icon}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-ms-red uppercase">
                          Section {current.number}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                          {current.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed font-light">
                    {current.text}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span>{isPaused ? "Paused (Reading mode)" : "Auto-scrolling every 5s"}</span>
                  </div>

                  {/* Navigation Arrow Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous Slide"
                      onClick={handlePrev}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label="Next Slide"
                      onClick={handleNext}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-ms-red text-white hover:bg-ms-red-dark transition-all active:scale-95 shadow-md"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Global CSS Animation keyframes for smooth motion */}
      <style jsx global>{`
        @keyframes progress5s {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}

function FeatureCard({ f }: { f: ReturnType<typeof getFeatures>[0] }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 shadow-lg">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-ms-red text-white shadow-md group-hover:scale-110 transition-transform duration-300">
        {f.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
      <p className="text-sm text-white/70 leading-relaxed mb-6 font-light">{f.body}</p>
      <ProtectedLink href={f.href} className="inline-flex items-center gap-2 text-sm font-semibold text-ms-red hover:text-white transition-colors">
        {f.cta} <span className="group-hover:translate-x-1 transition-transform">→</span>
      </ProtectedLink>
    </div>
  );
}

function VisitClinicSection({ locale }: { locale: Locale }) {
  const isAm = locale === "am";
  const V = t[locale as keyof typeof t].visit;
  const mapUrl = "https://www.google.com/maps/place/Medstar+Speciality+Clinic/@9.0180391,38.789169,966m/data=!3m1!1e3!4m6!3m5!1s0x164b85026ee08e67:0x7da1cd1ed14d5d28!8m2!3d9.0180391!4d38.789169!16s%2Fg%2F11k46nf7kx!5m1!1e1?hl=en&entry=ttu";

  return (
    <section className="bg-slate-50 py-24 border-t border-slate-200/60">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F6B] tracking-tight">{V.title}</h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base font-light">
            {isAm ? "በቀላሉ ይጎብኙን ወይም በዲጂታል መድረኮቻችን ያግኙን።" : "Find us easily in Addis Ababa or reach out through our official channels."}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-ms-red/10 text-ms-red flex items-center justify-center shrink-0 text-xl">📍</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-1">{V.addressLabel}</h4>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed font-light">{V.addressVal}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-[#0B1F6B]/10 text-[#0B1F6B] flex items-center justify-center shrink-0 text-xl">📞</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-1">{V.phoneLabel}</h4>
                <p className="text-sm text-slate-700 font-semibold">0975704070</p>
                <p className="text-sm text-slate-700 font-semibold">0116354280</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 text-xl">✈️</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-1">{V.telegramLabel}</h4>
                <a href="https://t.me/medstarinternalclinic" target="_blank" rel="noreferrer" className="text-sm text-ms-blue hover:underline font-semibold">
                  @medstarinternalclinic
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/70 flex-1 overflow-hidden">
              <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-slate-100">
                <iframe
                  title="Medstar Map Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.579548485238!2d38.789169!3d9.0180391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85026ee08e67%3A0x7da1cd1ed14d5d28!2sMedstar%20Speciality%20Clinic!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                />
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#0B1F6B] py-4 text-sm font-bold text-white shadow-lg hover:bg-[#1E3A8A] transition-all duration-300"
            >
              <span>🗺️</span>
              {V.openMap}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HomePage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const isAm = locale === "am";
  const ft = t[locale as keyof typeof t].footer;

  const summaryText = isAm
    ? "ሜድስታር ስፔሻሊቲ ክሊኒክ ከውሃ እና መስኖ ሚኒስቴር (ውሃ ልማት) ፊት ለፊት የሚገኝ የውስጥ ህክምና ስፔሻላይዝድ ክሊኒክ ነው።"
    : "MedStar Specialty Clinic is an Internal Medicine Specialized clinic located in front of the Water & Irrigation Ministry (Wuha Lemat).";

  const services = isAm
    ? ["የልብ ህክምና", "የነርቭ ህክምና", "የኩላሊት ህክምና", "የሳንባ ህክምና", "የሆርሞን ህክምና", "የምግብ መፈጨት", "የቆዳ ህክምና", "የሴቶች ህክምና"]
    : ["Cardiology", "Neurology", "Nephrology", "Pulmonology", "Endocrinology", "Gastroenterology", "Dermatology", "Gynecology"];

  const specialtiesList = isAm
    ? ["የልብ ህክምና", "የነርቭ ህክምና", "ህፃናት ህክምና", "የአጥንት ህክምና", "የዓይን ህክምና"]
    : ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology"];

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection locale={locale} />
        <IntroMissionVisionSection locale={locale} />

        <section id="directory" className="bg-white py-24">
          <Container>
            <div className="mb-14 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1F6B] tracking-tight">{t[locale as keyof typeof t].whyChooseUs.title}</h2>
              <p className="mt-3 text-slate-600 text-sm md:text-base font-light">{t[locale as keyof typeof t].whyChooseUs.sub}</p>
            </div>
            <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0B1F6B] to-[#1E3A8A] p-10 md:p-12 text-white">
                <h3 className="text-2xl md:text-3xl font-extrabold mb-4">{isAm ? "ስለ ሜድስታር ክሊኒክ" : "About MedStar Clinic"}</h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed font-light">{summaryText}</p>
              </div>
              <div className="p-10 md:p-12 bg-slate-50/50">
                <h4 className="text-lg font-bold text-[#0B1F6B] mb-6 tracking-wide uppercase text-xs">{isAm ? "የእኛ አገልግሎቶች" : "Our Specialties"}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {services.map((s) => (
                    <div key={s} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/70 p-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-ms-blue/40 transition-all">
                      <span className="h-2.5 w-2.5 rounded-full bg-ms-red shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#0B1F6B] py-24 text-white relative overflow-hidden">
          <Container className="relative z-10">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t[locale as keyof typeof t].everything.title}</h2>
              <p className="mt-3 text-white/70 text-sm md:text-base font-light">{t[locale as keyof typeof t].everything.sub}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {getFeatures(locale).map((f) => (
                <FeatureCard key={f.id} f={{ ...f, href: getLocalizedPath(locale, f.href) }} />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 border-b border-slate-100">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {getMetrics(locale).map((m) => (
                <div key={m.label} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center shadow-sm hover:shadow-md transition-all">
                  <p className="text-4xl md:text-5xl font-extrabold text-[#0B1F6B]" style={{ fontFamily: "Merriweather, Georgia, serif" }}>{m.value}</p>
                  <p className="mt-3 text-sm font-bold text-slate-800">{m.label}</p>
                  <p className="mt-1 text-xs text-slate-500 font-light">{m.sub}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <VisitClinicSection locale={locale} />

        <section className="bg-gradient-to-br from-[#07133b] to-[#0B1F6B] py-24 text-center text-white relative overflow-hidden">
          <Container className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 uppercase tracking-widest mb-6">
              {t[locale as keyof typeof t].cta.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{t[locale as keyof typeof t].cta.title}</h2>
            <p className="text-white/75 text-base md:text-lg font-light leading-relaxed mb-10">{t[locale as keyof typeof t].cta.sub}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <ProtectedLink href={getLocalizedPath(locale, "/book")} className="rounded-full bg-ms-red px-10 py-4 text-sm font-bold text-white shadow-xl hover:bg-ms-red-dark hover:scale-105 transition-all">
                {t[locale as keyof typeof t].cta.book}
              </ProtectedLink>
              <ProtectedLink href={getLocalizedPath(locale, "/dashboard")} className="rounded-full border border-white/20 bg-white/10 px-10 py-4 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all">
                {t[locale as keyof typeof t].cta.signIn}
              </ProtectedLink>
            </div>
          </Container>
        </section>

        <footer className="border-t border-white/10 bg-[#050e29] py-16 text-white">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-wider text-ms-red">MEDSTAR</span>
                  <span className="text-xs uppercase tracking-widest text-white/50">Specialty</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-light">{ft.tagline}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white/90">{ft.specialtiesTitle}</h4>
                <ul className="space-y-3 text-xs text-white/60 font-light">
                  {specialtiesList.map((item, index) => (
                    <li key={index}>
                      <Link href={getLocalizedPath(locale, "/book")} className="hover:text-white transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white/90">{ft.quickLinksTitle}</h4>
                <ul className="space-y-3 text-xs text-white/60 font-light">
                  <li><Link href={getLocalizedPath(locale, "/book")} className="hover:text-white transition-colors">{isAm ? "ቀጠሮ ይያዙ" : "Book Appointment"}</Link></li>
                  <li><Link href={getLocalizedPath(locale, "/dashboard")} className="hover:text-white transition-colors">{isAm ? "የታካሚ ፖርታል" : "Patient Portal"}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white/90">{ft.contactTitle}</h4>
                <ul className="space-y-3 text-xs text-white/60 font-light">
                  <li>📍 {ft.address}</li>
                  <li>📞 {ft.phone}</li>
                  <li>✉️ {ft.email}</li>
                </ul>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-light">
              <p>{ft.copyright}</p>
              <div className="flex gap-6">
                <Link href={getLocalizedPath(locale, `/privacy`)} className="hover:text-white/80 transition-colors">{ft.privacy}</Link>
                <Link href={getLocalizedPath(locale, `/terms`)} className="hover:text-white/80 transition-colors">{ft.terms}</Link>
                <Link href={getLocalizedPath(locale, `/contact`)} className="hover:text-white/80 transition-colors">{ft.contact}</Link>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </>
  );
}