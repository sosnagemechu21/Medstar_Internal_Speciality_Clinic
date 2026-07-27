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
    title: "Our Doctors & Medical Staff",
    subtitle: "Meet our team of experienced specialists, physicians, and healthcare professionals.",
    searchPlaceholder: "Search doctor by name, title or specialty...",
    noResults: "No doctors match your search.",
    scheduleLabel: "Schedule",
    specialtyLabel: "Specialty",
    doctorsCount: "doctors",
    brochureLink: "View Full Brochure",
    home: "Home",
  },
  am: {
    title: "የእኛ ዶክተሮች እና የህክምና ባለሙያዎች",
    subtitle: "ከልምድ የተካኑ ስፔሻሊስቶች፣ ሐኪሞች እና የጤና እንክብካቤ ባለሙያዎችን ያግኙ።",
    searchPlaceholder: "ዶክተርን በስም፣ በማዕረግ ወይም በስፔሻሊቲ ይፈልጉ...",
    noResults: "ምንም የሚገጥሙ ዶክተሮች የሉም።",
    scheduleLabel: "መርሐግብር",
    specialtyLabel: "ስፔሻሊቲ",
    doctorsCount: "ዶክተሮች",
    brochureLink: "ሙሉ ብሮሹር ይመልከቱ",
    home: "መነሻ",
  },
};

// Map title to icon/color for visual variety
const specialistStyles: Record<string, { color: string; bg: string }> = {
  Internist: { color: "text-blue-700", bg: "bg-blue-100" },
  Endocrinologist: { color: "text-green-700", bg: "bg-green-100" },
  Gastroenterologist: { color: "text-teal-700", bg: "bg-teal-100" },
  Hematologist: { color: "text-red-700", bg: "bg-red-100" },
  Neurologist: { color: "text-purple-700", bg: "bg-purple-100" },
  Dermatologist: { color: "text-pink-700", bg: "bg-pink-100" },
  Gynecologist: { color: "text-rose-700", bg: "bg-rose-100" },
  Urologist: { color: "text-cyan-700", bg: "bg-cyan-100" },
  Psychologist: { color: "text-indigo-700", bg: "bg-indigo-100" },
  Pathologist: { color: "text-amber-700", bg: "bg-amber-100" },
  GP: { color: "text-slate-700", bg: "bg-slate-100" },
  Cardiologist: { color: "text-orange-700", bg: "bg-orange-100" },
  Radiologist: { color: "text-violet-700", bg: "bg-violet-100" },
  Physiotherapist: { color: "text-lime-700", bg: "bg-lime-100" },
};

function getSpecialistStyle(title: string): { color: string; bg: string } {
  for (const [key, style] of Object.entries(specialistStyles)) {
    if (title.includes(key)) return style;
  }
  return { color: "text-ms-blue", bg: "bg-ms-blue/10" };
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DoctorsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const L = t[locale as keyof typeof t];
  const [search, setSearch] = useState("");

  const filteredStaff = brochureData.staff.filter((member) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      member.name.toLowerCase().includes(q) ||
      member.title.toLowerCase().includes(q) ||
      (member.schedule && member.schedule.toLowerCase().includes(q))
    );
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
            <span className="text-slate-600 font-medium">Doctors</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ms-blue md:text-4xl">{L.title}</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">{L.subtitle}</p>
          </div>

          {/* Search + brochure link */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <Link
              href={getLocalizedPath(locale, "/brochure")}
              className="flex items-center gap-2 text-sm font-semibold text-ms-red hover:text-ms-red-dark transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {L.brochureLink}
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-ms-blue">{filteredStaff.length}</span>
            <span>{L.doctorsCount}</span>
          </div>

          {/* Staff Grid */}
          {filteredStaff.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm">
              {L.noResults}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((member) => {
                const style = getSpecialistStyle(member.title);
                return (
                  <div
                    key={member.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-ms-blue/30 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.color} ${style.bg} transition-transform group-hover:scale-110`}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-ms-blue truncate">{member.name}</h3>
                        <p className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${style.color}`}>
                          {member.title}
                        </p>
                        {member.schedule && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3 shrink-0">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{member.schedule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}

