"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { resolveLocale } from "@/lib/i18n-utils";
import { brochureData } from "@/data/brochure";
import type { Locale } from "../../../../i18n.config";

const t = {
  en: {
    pageTitle: "MED-STAR Internal Medicine Speciality Clinic Brochure",
    section1Title: "General Services & Medical Specialties",
    inpatientOutpatient: "Inpatient & Outpatient Care",
    labTitle: "Advanced Diagnostic Laboratory",
    radiologyTitle: "Diagnostic Radiology",
    section2Title: "Why MED-STAR is Different",
    highlightsTitle: "Highlights",
    specialtyServicesTitle: "Specialty Services",
    radiologyServicesTitle: "Radiology Diagnostic Services",
    additionalServicesTitle: "Additional Services",
    addressTitle: "Address & Contact",
    section3Title: "Staff Directory / Working Hours",
    name: "Name",
    title: "Title",
    schedule: "Schedule",
    backHome: "← Back to Home",
  },
  am: {
    pageTitle: "የሜድ-ስታር የውስጥ ህክምና ስፔሻሊቲ ክሊኒክ ብሮሹር",
    section1Title: "አጠቃላይ አገልግሎቶች እና የህክምና ስፔሻሊቲዎች",
    inpatientOutpatient: "የሆስፒታል እና የተመላላሽ ታካሚ እንክብካቤ",
    labTitle: "የተራቀቀ የምርመራ ላቦራቶሪ",
    radiologyTitle: "የምርመራ ራዲዮሎጂ",
    section2Title: "ሜድ-ስታር ለምን የተለየ ነው",
    highlightsTitle: "ዋና ዋና ነጥቦች",
    specialtyServicesTitle: "ልዩ አገልግሎቶች",
    radiologyServicesTitle: "ራዲዮሎጂ የምርመራ አገልግሎቶች",
    additionalServicesTitle: "ተጨማሪ አገልግሎቶች",
    addressTitle: "አድራሻ እና መገኛ",
    section3Title: "የሰራተኞች መዝገብ / የስራ ሰዓት",
    name: "ስም",
    title: "ማዕረግ",
    schedule: "የስራ ሰዓት",
    backHome: "← ወደ መነሻ ይመለሱ",
  },
};

export default function BrochurePage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined) as Locale;
  const L = t[locale as keyof typeof t];
  const data = brochureData;

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#F4F6FB] min-h-screen">
        <Container className="py-12">
          {/* Back Button */}
          <a
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ms-blue hover:text-ms-red transition-colors mb-8"
          >
            {L.backHome}
          </a>

          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-ms-blue">
              {L.pageTitle}
            </h1>
          </div>

          {/* Section 1: General Services & Medical Specialties */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ms-blue mb-6 flex items-center gap-2">
              <span className="flex h-8 w-1 bg-ms-red rounded-full" />
              {L.section1Title}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-ms-blue mb-4 flex items-center gap-2">
                  🏥 {L.inpatientOutpatient}
                </h3>
                <p className="text-sm text-slate-600">
                  {data.section1.inpatientOutpatientCare}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-ms-blue mb-4 flex items-center gap-2">
                  🔬 {L.labTitle}
                </h3>
                <ul className="space-y-2">
                  {data.section1.advancedDiagnosticLaboratory.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-ms-red mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 md:col-span-2">
                <h3 className="font-bold text-lg text-ms-blue mb-4 flex items-center gap-2">
                  📡 {L.radiologyTitle}
                </h3>
                <ul className="grid gap-2 md:grid-cols-2">
                  {data.section1.diagnosticRadiology.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-ms-red mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Why MED-STAR is Different */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ms-blue mb-6 flex items-center gap-2">
              <span className="flex h-8 w-1 bg-ms-red rounded-full" />
              {L.section2Title}
            </h2>
            <div className="grid gap-6">
              {/* Highlights */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-ms-blue mb-4">{L.highlightsTitle}</h3>
                <ul className="space-y-3">
                  {data.whyDifferent.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0 text-xs font-bold">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-ms-blue mb-4">{L.specialtyServicesTitle}</h3>
                  <ul className="space-y-2">
                    {data.whyDifferent.specialtyServices.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-ms-red mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-ms-blue mb-4">{L.radiologyServicesTitle}</h3>
                  <ul className="space-y-2">
                    {data.whyDifferent.radiologyServices.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-ms-red mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-ms-blue mb-4">{L.additionalServicesTitle}</h3>
                  <ul className="space-y-2">
                    {data.whyDifferent.additionalServices.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-ms-red mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-ms-blue mb-4">{L.addressTitle}</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>{data.whyDifferent.address.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <span>{data.whyDifferent.address.telephone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-lg">✉️</span>
                    <span>{data.whyDifferent.address.email}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Staff Directory / Working Hours */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-ms-blue mb-6 flex items-center gap-2">
              <span className="flex h-8 w-1 bg-ms-red rounded-full" />
              {L.section3Title}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ms-blue text-white">
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">{L.name}</th>
                      <th className="px-4 py-3 text-left font-semibold">{L.title}</th>
                      <th className="px-4 py-3 text-left font-semibold">{L.schedule}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staff.map((member, idx) => (
                      <tr
                        key={member.id}
                        className={`border-t border-slate-100 transition-colors hover:bg-slate-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-400">{member.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{member.name}</td>
                        <td className="px-4 py-3 text-slate-600">{member.title}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {member.schedule || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}

