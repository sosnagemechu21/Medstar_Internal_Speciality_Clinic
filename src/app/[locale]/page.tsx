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
      body: isAm ? "የሚመጡ ቀጠሮዎችን ይመልከቱ፣ የህክምና መዝገቦችን ይድረሱ እና የጤና ጉዞዎን ያስተዳድሩ።" : "View upcoming appointments, access medical records, and manage your health journey.",
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
      body: isAm ? "በቻፓ ወይም በቴሌብር በብር ይክፈሉ። ፈጣን ደረሰኞች እና ሙሉ የክፍያ ታሪክ።" : "Pay via Chapa or Telebirr in ETB. Instant receipts and full payment history.",
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
          background: "linear-gradient(120deg, rgba(11,31,107,0.82) 50%, rgba(11,31,107,0.55) 100%)",
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
          <em className="block text-5xl md:text-6xl lg:text-[68px] font-bold not-italic text-white" style={{ fontFamily: "Merriweather, Georgia, serif", fontStyle: "italic" }}>
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
            className="group flex items-center gap-2 rounded-full bg-ms-red px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-ms-red-dark hover:scale-[1.04]"
          >
            {L.bookAppointment}
          </ProtectedLink>
          <ProtectedLink
            href="/dashboard"
            id="hero-portal-btn"
            className="group flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
          >
            {L.patientPortal}
          </ProtectedLink>
        </div>
        <div className="mt-12 md:mt-16 pt-10 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="group text-white transition-colors cursor-default">
                <p className="text-4xl md:text-5xl font-bold tracking-tight group-hover:text-ms-red transition-colors duration-200" style={{ fontFamily: "Merriweather, Georgia, serif" }}>
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
    </section>
  );
}

function IntroMissionVisionSection({ locale }: { locale: Locale }) {
  const L = t[locale as keyof typeof t].introMissionVision;
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: L.introductionTitle,
      icon: "🏥",
      gradient: "from-[#0B1F6B] to-[#1E3A8A]",
      text: locale === "am"
        ? "ስሙ እንደሚያመለክተው የውስጥ ህክምና ስፔሻላይዝድ ክሊኒክ ነው። ከውሃ እና መስኖ ሚኒስቴር (ውሃ ልማት) ፊት ለፊት ይገኛል።"
        : "As the name indicates it's an Internal Medicine Specialized clinic. Located in front of Water & irrigation Ministry.",
    },
    {
      title: L.missionTitle,
      icon: "🎯",
      gradient: "from-[#CC2936] to-[#a81f2a]",
      text: locale === "am"
        ? "ከፍተኛ ጥራት ያለው በታካሚ ላይ ያተኮረ፣ በቀላሉ ተደራሽ፣ ወጪ ቆጣቢ እና የምናገለግለውን ማህበረሰብ ፍላጎት የሚያሟላ የጤና እንክብካቤ አቅራቢ መሆን።"
        : "To be a provider of high quality patient-focused health care that is readily accessible, cost effective and meets the needs of the community we serve.",
    },
    {
      title: L.visionTitle,
      icon: "👁️",
      gradient: "from-[#0B1F6B] to-[#CC2936]",
      text: locale === "am"
        ? "ለልህቀት ባለው ቁርጠኝነት፣ የታካሚዎችን የሚጠበቀውን በማለፍ፣ ጥራት ያለው የህክምና አገልግሎት በማስፋፋት የህብረተሰባችን የጤና እንክብካቤ መሪ መሆን።"
        : "To be distinguished as our community's health care leader for its commitment to excellence, exceeding patient expectations through quality services.",
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
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <div className={`bg-gradient-to-br ${current.gradient} p-8 md:p-12`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl md:text-5xl">{current.icon}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{current.title}</h2>
              </div>
              <p className="text-sm md:text-base text-white/85 leading-relaxed">{current.text}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ f }: { f: ReturnType<typeof getFeatures>[0] }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 cursor-default">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ms-red/20 text-ms-red group-hover:bg-ms-red group-hover:text-white transition-all duration-300">
        {f.icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
      <p className="text-sm text-white/55 leading-relaxed mb-5">{f.body}</p>
      <ProtectedLink href={f.href} className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-ms-red hover:underline underline-offset-4">
        {f.cta}
      </ProtectedLink>
    </div>
  );
}

function VisitClinicSection({ locale }: { locale: Locale }) {
  const isAm = locale === "am";
  const V = t[locale as keyof typeof t].visit;
  const mapUrl = "https://www.google.com/maps/place/Medstar+Speciality+Clinic/@9.0180391,38.789169,966m/data=!3m1!1e3!4m6!3m5!1s0x164b85026ee08e67:0x7da1cd1ed14d5d28!8m2!3d9.0180391!4d38.789169!16s%2Fg%2F11k46nf7kx!5m1!1e1?hl=en&entry=ttu";

  return (
    <section className="bg-[#F4F6FB] py-20">
      <Container>
        <h2 className="text-3xl font-bold text-ms-blue md:text-4xl mb-10">
          {V.title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-ms-red/10 text-ms-red flex items-center justify-center shrink-0">
                📍
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{V.addressLabel}</h4>
                <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed">
                  {V.addressVal}
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-ms-blue/10 text-ms-blue flex items-center justify-center shrink-0">
                📞
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{V.phoneLabel}</h4>
                <p className="text-sm text-slate-600 font-medium">0975704070</p>
                <p className="text-sm text-slate-600 font-medium">0116354280</p>
              </div>
            </div>

            {/* Telegram Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                ✈️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{V.telegramLabel}</h4>
                <a href="https://t.me/medstarinternalclinic" target="_blank" rel="noreferrer" className="text-sm text-ms-blue hover:underline font-medium">
                  @medstarinternalclinic
                </a>
              </div>
            </div>
          </div>

          {/* Right Side: Map Preview & Button */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 overflow-hidden">
              <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-slate-100">
                <iframe
                  title="Medstar Map Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.579548485238!2d38.789169!3d9.0180391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85026ee08e67%3A0x7da1cd1ed14d5d28!2sMedstar%20Speciality%20Clinic!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0B1F6B] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1E3A8A]"
            >
              <span>📍</span>
              {V.openMap}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
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

  const specialtiesList = isAm
    ? ["የልብ ህክምና", "የነርቭ ህክምና", "ህፃናት ህክምና", "የአጥንት ህክምና", "የዓይን ህክምና"]
    : ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Ophthalmology"];

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection locale={locale} />
        <IntroMissionVisionSection locale={locale} />

        <section className="bg-ms-blue py-20">
          <Container>
            <div className="grid gap-6 md:grid-cols-3">
              {getFeatures(locale).map((f) => (
                <FeatureCard key={f.id} f={{ ...f, href: getLocalizedPath(locale, f.href) }} />
              ))}
            </div>
          </Container>
        </section>

        {/* ── Visit Our Clinic Section Added Here ────────────────────────── */}
        <VisitClinicSection locale={locale} />

        {/* ── Custom Multi-Column Footer Matching Image ──────────────────── */}
        <footer className="border-t border-white/10 bg-[#07133b] py-16 text-white">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Column 1: Logo & Tagline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-wider text-ms-red">MEDSTAR</span>
                  <span className="text-xs uppercase tracking-widest text-white/60">Specialty Clinic</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {ft.tagline}
                </p>
              </div>

              {/* Column 2: Specialities */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
                  {ft.specialtiesTitle}
                </h4>
                <ul className="space-y-2.5 text-xs text-white/60">
                  {specialtiesList.map((item, index) => (
                    <li key={index}>
                      <Link href={getLocalizedPath(locale, "/book")} className="hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Quick Links */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
                  {ft.quickLinksTitle}
                </h4>
                <ul className="space-y-2.5 text-xs text-white/60">
                  <li>
                    <Link href={getLocalizedPath(locale, "/book")} className="hover:text-white transition-colors">
                      {isAm ? "ዶክተር ይፈልጉ" : "Find a Doctor"}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedPath(locale, "/book")} className="hover:text-white transition-colors">
                      {isAm ? "ቀጠሮ ይያዙ" : "Book Appointment"}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedPath(locale, "/dashboard")} className="hover:text-white transition-colors">
                      {isAm ? "የታካሚ ፖርታል" : "Patient Portal"}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedPath(locale, "/contact")} className="hover:text-white transition-colors">
                      {isAm ? "ስለ እኛ" : "About Us"}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Contact info */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">
                  {ft.contactTitle}
                </h4>
                <ul className="space-y-3 text-xs text-white/60">
                  <li className="flex items-start gap-2">
                    <span>📍</span>
                    <span>{ft.address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{ft.phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✉️</span>
                    <span>{ft.email}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
              <p>{ft.copyright}</p>
              <div className="flex gap-6">
                <Link href={getLocalizedPath(locale, `/privacy`)} className="hover:text-white/80 transition-colors">
                  {ft.privacy}
                </Link>
                <Link href={getLocalizedPath(locale, `/terms`)} className="hover:text-white/80 transition-colors">
                  {ft.terms}
                </Link>
                <Link href={getLocalizedPath(locale, `/contact`)} className="hover:text-white/80 transition-colors">
                  {ft.contact}
                </Link>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </>
  );
}