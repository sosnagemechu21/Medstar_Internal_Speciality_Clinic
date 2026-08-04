"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import {
  fetchDoctors,
  fetchSpecialties,
  type DoctorListItem,
  type SpecialtyListItem,
} from "@/lib/catalog-api";
import { resolveLocale } from "@/lib/i18n-utils";
import { getLocalizedPath } from "@/lib/locale-routing";
import { useAuth } from "@/providers/auth-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

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

const STEPS = ["Speciality", "Doctor", "Date & Time", "Confirm"];

type BookingState = {
  specialty: SpecialtyListItem | null;
  doctor: DoctorListItem | null;
  date: Date | null;
  time: string | null;
  paymentMethod: string;
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-ms-red text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${active ? "text-ms-red" : "text-slate-400"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-2 mb-5 ${done ? "bg-green-400" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Calendar({
  selected,
  onSelect,
  locale,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  locale: "en" | "am";
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const localeTag = locale === "am" ? "am-ET" : "en-US";
  const monthName = today.toLocaleString(localeTag, {
    month: "long",
    year: "numeric",
  });

  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <p className="text-sm font-bold text-ms-blue mb-4">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <span key={d} className="font-semibold text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const date = new Date(year, month, day);
          const isSelected =
            selected?.getDate() === day && selected?.getMonth() === month;
          const isPast =
            date <
            new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(date)}
              className={`h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-ms-blue text-white"
                  : isPast
                    ? "text-slate-300 cursor-not-allowed"
                    : "hover:bg-ms-blue/10 text-slate-700"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(date: Date, locale: "en" | "am") {
  const localeTag = locale === "am" ? "am-ET" : "en-US";
  return date.toLocaleDateString(localeTag, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string, locale: "en" | "am") {
  const [hour, minute] = time.split(":").map(Number);
  const localeTag = locale === "am" ? "am-ET" : "en-US";
  return new Intl.DateTimeFormat(localeTag, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

function formatTimeRange(
  startTime: string,
  endTime: string,
  locale: "en" | "am",
) {
  return `${formatTime(startTime, locale)} - ${formatTime(endTime, locale)}`;
}

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookPage() {
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(
    typeof params.locale === "string" ? params.locale : undefined,
  );
  const localizedBookHref = getLocalizedPath(locale, "/book");
  const localizedHomeHref = getLocalizedPath(locale, "/");
  const localizedPortalHref = getLocalizedPath(locale, "/dashboard");
  const { user, refresh } = useAuth();
  const { loading } = useRequireAuth(localizedBookHref);
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [ref, setRef] = useState("");
  const [specialties, setSpecialties] = useState<SpecialtyListItem[]>([]);
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    specialty: null,
    doctor: null,
    date: null,
    time: null,
    paymentMethod: "Chapa",
  });

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

        setCatalogError("Unable to load booking options right now.");
      } finally {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [locale]);

  useEffect(() => {
    const controller = new AbortController();

    if (!booking.doctor || !booking.date) {
      setAvailableSlots([]);
      setAvailabilityError(null);
      setAvailabilityLoading(false);
      return () => controller.abort();
    }

    async function loadAvailability() {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError(null);

        const searchParams = new URLSearchParams({
          date: toDateParam(booking.date!),
        });

        const response = await fetch(
          `/api/doctors/${booking.doctor!.id}/availability?${searchParams.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = (await response.json()) as {
          error?: string;
          slots?: AvailabilitySlot[];
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load available slots.");
        }

        setAvailableSlots(data.slots ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setAvailableSlots([]);
        setAvailabilityError(
          (error as Error).message || "Unable to load available slots.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => controller.abort();
  }, [booking.date, booking.doctor]);

  const availableDoctors = booking.specialty
    ? doctors.filter((doctor) => doctor.specialtyId === booking.specialty?.id)
    : doctors;

  const selectedSlot =
    availableSlots.find((slot) => slot.startTime === booking.time) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!booking.doctor || !booking.date || !selectedSlot) {
      setSubmitError("Select a valid time slot before confirming.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // 1. Create appointment in database so it renders in the patient portal
      const apptResponse = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          doctorId: booking.doctor.id,
          appointmentDate: toDateParam(booking.date),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }),
      });

      const apptData = await apptResponse.json();
      if (!apptResponse.ok) {
        throw new Error(apptData.error ?? "Unable to create appointment.");
      }

      // 2. Initialize Chapa payment redirect
      const response = await fetch("/api/payments/chapa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "100",
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Failed to initialize payment.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      setSubmitError((error as Error).message || "Unable to process payment.");
      setSubmitting(false);
    }
  };

  if (
    confirmed &&
    booking.doctor &&
    booking.specialty &&
    booking.date &&
    booking.time
  ) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#F4F6FB] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white">
            <div className="bg-gradient-to-br from-ms-blue to-ms-blue-mid px-8 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Appointment Confirmed!</h2>
              <p className="text-white/70 text-sm mt-1">REF: {ref}</p>
            </div>
            <div className="px-8 py-6 space-y-3 text-sm font-mono">
              {[
                ["Patient", user?.fullName ?? user?.displayName ?? "—"],
                ["Speciality", booking.specialty.name],
                ["Doctor", booking.doctor.name],
                ["Date", formatDate(booking.date, locale)],
                [
                  "Time",
                  selectedSlot
                    ? formatTimeRange(
                        selectedSlot.startTime,
                        selectedSlot.endTime,
                        locale,
                      )
                    : formatTime(booking.time, locale),
                ],
                ["Fee", "ETB 100"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-b border-slate-100 pb-2"
                >
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-ms-blue">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-8 pb-8 space-y-3">
              <Link
                href={localizedPortalHref}
                className="block w-full rounded-xl bg-ms-blue py-3 text-center text-sm font-bold text-white hover:bg-ms-blue-mid transition-colors"
              >
                View in Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setConfirmed(false);
                  setStep(1);
                  setBooking({
                    specialty: null,
                    doctor: null,
                    date: null,
                    time: null,
                    paymentMethod: "Chapa",
                  });
                }}
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB]">
        <Container className="py-10">
          <Link
            href={localizedHomeHref}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-ms-blue mb-6 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to home
          </Link>

          <h1
            className="text-3xl font-bold text-ms-blue"
            style={{ fontFamily: "Merriweather, Georgia, serif" }}
          >
            Book an Appointment
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">
            Hello, {user?.displayName ?? "there"}. Let&apos;s get you scheduled.
          </p>

          <StepIndicator current={step} />

          {/* Step 1 — Speciality */}
          {step === 1 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-ms-blue">
                    Choose a Speciality or Doctor
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a specialty department or jump directly to your preferred specialist.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBooking((b) => ({ ...b, specialty: null }));
                    setStep(2);
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-ms-blue hover:border-ms-blue hover:bg-ms-blue/5 transition-colors shrink-0"
                >
                  Browse All Doctors Directly →
                </button>
              </div>

              {catalogLoading && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                  Loading specialties…
                </div>
              )}
              {!catalogLoading && catalogError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">
                  {catalogError}
                </div>
              )}
              {!catalogLoading && !catalogError && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialties.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => {
                        setBooking((b) => ({
                          ...b,
                          specialty: sp,
                          doctor: null,
                          date: null,
                          time: null,
                        }));
                        setStep(2);
                      }}
                      className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 p-5 text-left hover:border-ms-blue/40 hover:shadow-md transition-all bg-white"
                    >
                      <span className="text-2xl">
                        {getSpecialtyIcon(sp.name)}
                      </span>
                      <div>
                        <p className="font-bold text-ms-blue group-hover:text-ms-red transition-colors">
                          {sp.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sp.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Doctor */}
          {step === 2 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-ms-blue">
                    Select Your Doctor
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {booking.specialty
                      ? `Showing ${booking.specialty.name} specialists (${availableDoctors.length})`
                      : `Showing all available specialists (${availableDoctors.length})`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold text-slate-400 hover:text-ms-blue"
                >
                  ← Back to Specialities
                </button>
              </div>

              {/* Specialty Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setBooking((b) => ({ ...b, specialty: null }))}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    booking.specialty === null
                      ? "bg-ms-blue text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Doctors ({doctors.length})
                </button>
                {specialties.map((sp) => {
                  const active = booking.specialty?.id === sp.id;
                  const docCount = doctors.filter((d) => d.specialtyId === sp.id).length;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setBooking((b) => ({ ...b, specialty: sp }))}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                        active
                          ? "bg-ms-blue text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {sp.name} ({docCount})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {catalogLoading && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                    Loading doctors…
                  </div>
                )}
                {!catalogLoading && catalogError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">
                    {catalogError}
                  </div>
                )}
                {!catalogLoading &&
                  !catalogError &&
                  availableDoctors.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                      No doctors are available for this filter yet.
                    </div>
                  )}
                {!catalogLoading &&
                  !catalogError &&
                  availableDoctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doc={doc}
                      onSelect={() => {
                        setSubmitError(null);
                        const matchedSpecialty =
                          specialties.find((s) => s.id === doc.specialtyId) || {
                            id: doc.specialtyId,
                            name: doc.specialty.name,
                            description: doc.specialty.description,
                            doctorCount: 1,
                          };
                        setBooking((b) => ({
                          ...b,
                          doctor: doc,
                          specialty: matchedSpecialty,
                          date: null,
                          time: null,
                        }));
                        setStep(3);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Step 3 — Date & Time */}
          {step === 3 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-ms-blue">
                  Pick a Date & Time
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-slate-400 hover:text-ms-blue"
                >
                  ← Back
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Calendar
                  selected={booking.date}
                  locale={locale}
                  onSelect={(d) =>
                    setBooking((b) => ({ ...b, date: d, time: null }))
                  }
                />
                <div>
                  <p className="text-sm font-bold text-ms-blue mb-4">
                    {booking.date
                      ? `Available Times · ${booking.date.toLocaleDateString(locale === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric" })}`
                      : "Available Times"}
                  </p>
                  {!booking.date ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                      Select a date to see available slots.
                    </div>
                  ) : availabilityLoading ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                      Loading available slots…
                    </div>
                  ) : availabilityError ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">
                      {availabilityError}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                      No available slots remain for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {availableSlots.map((slot) => {
                        const selected = booking.time === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => {
                              setSubmitError(null);
                              setBooking((b) => ({
                                ...b,
                                time: slot.startTime,
                              }));
                            }}
                            className={`rounded-lg py-2.5 px-3 text-xs font-semibold transition-colors ${
                              selected
                                ? "bg-ms-red text-white"
                                : "border border-slate-200 hover:border-ms-blue text-slate-700"
                            }`}
                          >
                            {formatTimeRange(
                              slot.startTime,
                              slot.endTime,
                              locale,
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {booking.date && booking.time && (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="mt-6 w-full rounded-xl bg-ms-blue py-3 text-sm font-bold text-white hover:bg-ms-blue-mid transition-colors"
                    >
                      Continue to Confirm →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Confirm & Pay */}
          {step === 4 &&
            booking.doctor &&
            booking.specialty &&
            booking.date &&
            booking.time && (
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-ms-blue">
                      Confirm Appointment
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-sm text-slate-400 hover:text-ms-blue"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-ms-blue/10 flex items-center justify-center text-xl">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="font-bold text-ms-blue">
                        {booking.doctor.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.doctor.title}
                      </p>
                    </div>
                  </div>
                  {[
                    ["Patient", user?.fullName ?? user?.displayName ?? "—"],
                    [
                      "Patient ID",
                      `MSC-${Math.floor(10000 + Math.random() * 90000)}`,
                    ],
                    ["Date", formatDate(booking.date, locale)],
                    ["Time", formatTime(booking.time, locale)],
                    ["Location", "22 near Tabot maderia, Addis Ababa"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-2.5 border-b border-slate-100 text-sm"
                    >
                      <span className="text-slate-400">{k}</span>
                      <span className="font-semibold text-ms-blue">{v}</span>
                    </div>
                  ))}
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-green-600">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Your appointment data is encrypted and secure
                  </p>
                </div>

                <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                  <h2 className="text-lg font-bold text-ms-blue mb-6">
                    Payment
                  </h2>
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-slate-500">
                      <span>Appointment fee</span>
                      <span>ETB 90</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Service fee</span>
                      <span>ETB 10</span>
                    </div>
                    <div className="flex justify-between font-bold text-ms-blue pt-2 border-t">
                      <span>Total</span>
                      <span>ETB 100</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                    Pay With
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {["Chapa", "Telebirr", "CBE Birr", "Bank"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setBooking((b) => ({ ...b, paymentMethod: m }))
                        }
                        className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                          booking.paymentMethod === m
                            ? "border-ms-blue bg-ms-blue/5 text-ms-blue"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  {submitError && (
                    <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full rounded-xl bg-ms-red py-3.5 text-sm font-bold text-white hover:bg-ms-red-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Locking Slot..." : "Pay ETB 100 & Confirm →"}
                  </button>
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-green-600">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    PCI-DSS Level 1 secured
                  </p>
                </div>
              </div>
            )}
        </Container>
      </main>
    </>
  );
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

function DoctorCard({
  doc,
  onSelect,
}: {
  doc: DoctorListItem;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-5 hover:border-ms-blue/40 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center gap-4 min-w-0">
        {doc.photoUrl ? (
          <img
            src={doc.photoUrl}
            alt={doc.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-ms-blue/20 shrink-0"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-ms-blue to-ms-blue-mid flex items-center justify-center text-base font-bold text-white">
            {getInitials(doc.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-ms-blue">{doc.name}</p>
            {doc.experienceYears > 0 && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                {doc.experienceYears}+ yrs
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{doc.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {doc.bio || doc.specialty.description}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[10px] font-bold text-green-600 uppercase">
        Available
      </span>
    </button>
  );
}
