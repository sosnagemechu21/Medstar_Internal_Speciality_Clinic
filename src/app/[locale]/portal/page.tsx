"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/providers/auth-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath } from "@/lib/locale-routing";
import { isStaffRole } from "@/lib/portal-routing";

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  doctor: { firstNameEn: string; lastNameEn: string };
}

export default function PortalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === "string" ? params.locale : undefined);
  const localizedDashboardHref = getLocalizedPath(locale, "/dashboard");
  const localizedBookHref = getLocalizedPath(locale, "/book");
  const { loading } = useRequireAuth("/portal");
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    if (isStaffRole(user.role)) {
      router.replace(localizedDashboardHref);
      return;
    }

    fetch("/api/patient/appointments", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setUpcoming(data.upcoming ?? []);
        setHistory(data.history ?? []);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [loading, localizedDashboardHref, router, user]);

  if (loading || !user || isStaffRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB]">
        <Container className="py-10">
          <h1 className="text-3xl font-bold text-ms-blue" style={{ fontFamily: "Merriweather, Georgia, serif" }}>
            Patient Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">
            Welcome back, {user?.fullName ?? user?.displayName}.
          </p>

          <div className="flex gap-3 mb-8">
            <Link
              href={localizedBookHref}
              className="rounded-full bg-ms-red px-6 py-2.5 text-sm font-bold text-white hover:bg-ms-red-dark transition-colors"
            >
              Book Appointment
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <AppointmentList
              title="Upcoming Appointments"
              empty="No upcoming appointments."
              items={upcoming}
              fetching={fetching}
            />
            <AppointmentList
              title="Past Appointments"
              empty="No past appointments."
              items={history}
              fetching={fetching}
            />
          </div>
        </Container>
      </main>
    </>
  );
}

function AppointmentList({
  title,
  empty,
  items,
  fetching,
}: {
  title: string;
  empty: string;
  items: Appointment[];
  fetching: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <h2 className="text-base font-bold text-ms-blue mb-4">{title}</h2>
      {fetching ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-semibold text-ms-blue text-sm">
                Dr. {a.doctor.firstNameEn} {a.doctor.lastNameEn}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(a.appointmentDate).toLocaleDateString()} · {a.startTime}
              </p>
              <span className="inline-block mt-2 rounded-full bg-ms-blue/10 px-2.5 py-0.5 text-[10px] font-bold text-ms-blue uppercase">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
