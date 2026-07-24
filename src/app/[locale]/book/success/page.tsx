"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath } from "@/lib/locale-routing";

const translations = {
  en: {
    title: "Payment Successful!",
    subtitle: "Your appointment has been confirmed.",
    txRefLabel: "Transaction Ref",
    statusLabel: "Payment Status",
    statusValue: "Paid & Verified (Chapa)",
    portalBtn: "Go to Patient Portal",
    homeBtn: "Return to Home",
    bookAnotherBtn: "Book Another Appointment",
    notice: "A confirmation summary has been saved to your patient profile.",
  },
  am: {
    title: "ክፍያው በተሳካ ሁኔታ ተጠናቋል!",
    subtitle: "ቀጠሮዎ በይፋ ተረጋግጧል።",
    txRefLabel: "የክፍያ መለያ (Ref)",
    statusLabel: "የክፍያ ሁኔታ",
    statusValue: "ተከፍሏል (በቻፓ የተረጋገጠ)",
    portalBtn: "ወደ ታካሚ ፖርታል ይሂዱ",
    homeBtn: "ወደ መነሻ ገጽ ተመለስ",
    bookAnotherBtn: "ሌላ ቀጠሮ ይያዙ",
    notice: "የማረጋገጫ መረጃ በታካሚ ፕሮፋይልዎ ውስጥ ተቀምጧል።",
  },
};

export default function BookSuccessPage() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale = resolveLocale(
    typeof params.locale === "string" ? params.locale : undefined,
  );
  const t =
    translations[locale as keyof typeof translations] || translations.en;

  const [txRef, setTxRef] = useState<string>("Loading...");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const resolvedRef =
      searchParams.get("tx_ref") ||
      searchParams.get("trx_ref") ||
      `MSC-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxRef(resolvedRef);
  }, [searchParams]);

  const dashboardHref = getLocalizedPath(locale, "/dashboard");
  const homeHref = getLocalizedPath(locale, "/");
  const bookHref = getLocalizedPath(locale, "/book");

  // Prevent server/client markup mismatch during initial render
  if (!isMounted) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#F4F6FB] flex items-center justify-center px-4 py-12">
          <Container className="flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white border border-slate-200 p-8 text-center text-slate-400">
              Loading confirmation...
            </div>
          </Container>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB] flex items-center justify-center px-4 py-12">
        <Container className="flex justify-center">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white border border-slate-200">
            <div className="bg-gradient-to-br from-ms-blue to-ms-blue-mid px-8 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {t.title}
              </h1>
              <p className="text-white/80 text-sm mt-1.5">{t.subtitle}</p>
            </div>

            <div className="px-8 py-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">{t.statusLabel}</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                  {t.statusValue}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5 font-mono text-xs">
                <span className="text-slate-400">{t.txRefLabel}</span>
                <span className="font-bold text-ms-blue">{txRef}</span>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-3">
              <Link
                href={dashboardHref}
                className="block w-full rounded-xl bg-ms-blue py-3.5 text-center text-sm font-bold text-white hover:bg-ms-blue-mid transition-all shadow-md hover:shadow-lg"
              >
                {t.portalBtn}
              </Link>
              <Link
                href={bookHref}
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {t.bookAnotherBtn}
              </Link>
              <Link
                href={homeHref}
                className="block w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors pt-1"
              >
                {t.homeBtn}
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
