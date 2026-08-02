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
      origin: "አዲስ አበባ · ኢትዮጵያ · ከ 2010 ዓ.ም ጀምሮ",
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
        <div className="mb-7 inline-flex">
          <span className="flex items-center gap-2 rounded-full border border-ms-red/40 bg-ms-red/10 px-4 py-2 text-xs font-semibold text-ms-red uppercase tracking-wider backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-ms-red animate-pulse" />
            {L.origin}
          </span>
        </div>
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
        : "As the name indicates it's an Internal Medicine Specialized clinic located in front of Water & irrigation Ministry, equipped with advanced international-standard medical devices.",
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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F6FB] to-white py-24">
      <Container>
        <div className="relative mx-auto max-w-4xl">
          <div className="flex justify-center gap-3 mb-10">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-[#0B1F6B] text-white shadow-md scale-105"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-3xl shadow-2xl border border-slate-100">
            <div className={`bg-gradient-to-br ${current.gradient} p-10 md:p-14 text-white relative`}>
              <div className="absolute top-6 right-8 text-7xl opacity-10">{current.icon}</div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl md:text-5xl">{current.icon}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{current.title}</h2>
              </div>
              <p className="text-base md:text-lg text-white/90 leading-relaxed font-light max-w-3xl">{current.text}</p>
            </div>
          </div>
        </div>
      </Container>
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