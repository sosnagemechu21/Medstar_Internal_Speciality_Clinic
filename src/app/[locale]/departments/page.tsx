"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { brochureData } from "@/data/brochure";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath } from "@/lib/locale-routing";
import type { Locale } from "../../../../i18n.config";

const t = {
  en: {
    title: "Our Services & Specialties",
    subtitle: "Explore our comprehensive range of medical services, diagnostic facilities, and specialty care.",
    searchPlaceholder: "Search services...",
    noResults: "No services match your search.",
    generalServices: "General Services",
    diagnosticLab: "Advanced Diagnostic Laboratory",
    diagnosticRadiology: "Diagnostic Radiology",
    specialtyServices: "Specialty Services",
    radiologyServices: "Radiology Diagnostic Services",
    additionalServices: "Additional Services",
    whyDifferent: "Why MED-STAR is Different",
    location: "Location",
    telephone: "Telephone",
    email: "Email",
    home: "Home",
    brochure: "View Full Brochure",
  },
  am: {
    title: "የእኛ አገልግሎቶች እና ስፔሻሊቲዎች",
    subtitle: "የተሟላ የህክምና አገልግሎቶች፣ የምርመራ ተቋማት እና የልዩ እንክብካቤ አገልግሎቶቻችንን ያስሱ።",
    searchPlaceholder: "አገልግሎቶችን ይፈልጉ...",
    noResults: "ምንም የሚገጥሙ አገልግሎቶች የሉም።",
    generalServices: "አጠቃላይ አገልግሎቶች",
    diagnosticLab: "የላቀ የምርመራ ላቦራቶሪ",
    diagnosticRadiology: "የምርመራ ራዲዮሎጂ",
    specialtyServices: "ልዩ አገልግሎቶች",
    radiologyServices: "ራዲዮሎጂ የምርመራ አገልግሎቶች",
    additionalServices: "ተጨማሪ አገልግሎቶች",
    whyDifferent: "ሜድስታር ለምን የተለየ ነው",
    location: "አድራሻ",
    telephone: "ስልክ",
    email: "ኢሜይል",
    home: "መነሻ",
    brochure: "ሙሉ ብሮሹር ይመልከቱ",
  },
};

export default function DepartmentsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const L = t[locale as keyof typeof t];
  const [search, setSearch] = useState("");

  const allServices = [
    ...brochureData.whyDifferent.specialtyServices.map((s) => ({ type: "specialty" as const, name: s })),
    ...brochureData.whyDifferent.radiologyServices.map((s) => ({ type: "radiology" as const, name: s })),
    ...brochureData.whyDifferent.additionalServices.map((s) => ({ type: "additional" as const, name: s })),
    ...brochureData.section1.advancedDiagnosticLaboratory.map((s) => ({ type: "lab" as const, name: s })),
    ...brochureData.section1.diagnosticRadiology.map((s) => ({ type: "radiology-detailed" as const, name: s })),
  ];

  const filteredServices = allServices.filter((s) => {
    if (!search.trim()) return true;
    return s.name.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB]">
        <Container className="py-12">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
            <Link href={getLocalizedPath(locale, "/")} className="hover:text-ms-blue transition-colors">
              {L.home}
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Services</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ms-blue md:text-4xl">{L.title}</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">{L.subtitle}</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative w-full sm:w-80">
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
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={L.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/25 focus:border-ms-blue/40 transition-shadow"
              />
            </div>
          </div>

          {/* === Why Different === */}
          <div className="mb-10 rounded-2xl bg-gradient-to-br from-ms-blue to-ms-navy-dark p-8 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-4">{L.whyDifferent}</h2>
            <ul className="space-y-2">
              {brochureData.whyDifferent.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5 shrink-0 text-green-400 mt-0.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* === General Services === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.generalServices}</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-slate-700 font-medium">{brochureData.section1.inpatientOutpatientCare}</p>
            </div>
          </div>

          {/* === Advanced Diagnostic Laboratory === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.diagnosticLab}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {brochureData.section1.advancedDiagnosticLaboratory.map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">{i + 1}</div>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* === Diagnostic Radiology === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.diagnosticRadiology}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {brochureData.section1.diagnosticRadiology.map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">{i + 1}</div>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* === Specialty Services === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.specialtyServices}</h2>
            <div className="flex flex-wrap gap-2">
              {brochureData.whyDifferent.specialtyServices.map((item, i) => (
                <span key={i} className="rounded-full bg-ms-red/10 text-ms-red px-4 py-2 text-sm font-semibold">{item}</span>
              ))}
            </div>
          </div>

          {/* === Radiology Diagnostics === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.radiologyServices}</h2>
            <div className="flex flex-wrap gap-2">
              {brochureData.whyDifferent.radiologyServices.map((item, i) => (
                <span key={i} className="rounded-full bg-teal-100 text-teal-700 px-4 py-2 text-sm font-semibold">{item}</span>
              ))}
            </div>
          </div>

          {/* === Additional Services === */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-ms-blue mb-4">{L.additionalServices}</h2>
            <div className="space-y-2">
              {brochureData.whyDifferent.additionalServices.map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ms-blue text-white text-xs font-bold">{i + 1}</span>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* === Contact === */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ms-blue mb-3">Contact</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-700">{L.location}:</span> {brochureData.whyDifferent.address.location}</p>
              <p><span className="font-semibold text-slate-700">{L.telephone}:</span> {brochureData.whyDifferent.address.telephone}</p>
              <p><span className="font-semibold text-slate-700">{L.email}:</span> {brochureData.whyDifferent.address.email}</p>
            </div>
          </div>

          {/* Brochure link */}
          <div className="mt-8 text-center">
            <Link
              href={getLocalizedPath(locale, "/brochure")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-ms-red hover:text-ms-red-dark transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {L.brochure}
            </Link>
          </div>
        </Container>
      </main>
    </>
  );
}

