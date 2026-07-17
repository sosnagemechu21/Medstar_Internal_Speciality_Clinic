"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/providers/auth-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";

/* ─── Static data (UI mock — wire to API later) ─── */
const SPECIALTIES = [
  { id: "cardiology", name: "Cardiology", desc: "Heart & cardiovascular system", icon: "❤️" },
  { id: "neurology", name: "Neurology", desc: "Brain & nervous system", icon: "🧠" },
  { id: "ophthalmology", name: "Ophthalmology", desc: "Eyes & vision care", icon: "👁️" },
  { id: "orthopedics", name: "Orthopedics", desc: "Bones, joints & muscles", icon: "🦴" },
  { id: "pediatrics", name: "Pediatrics", desc: "Children's healthcare", icon: "👶" },
  { id: "general", name: "General Medicine", desc: "Primary & preventive care", icon: "🩺" },
];

const DOCTORS = [
  { id: "dr-samuel", name: "Dr. Samuel Bekele", specialty: "neurology", specialtyLabel: "Neurology", exp: 10, rating: 4.8, reviews: 189 },
  { id: "dr-dawit", name: "Dr. Dawit Abebe", specialty: "cardiology", specialtyLabel: "Cardiology", exp: 12, rating: 4.9, reviews: 210 },
  { id: "dr-helen", name: "Dr. Helen Tadesse", specialty: "pediatrics", specialtyLabel: "Pediatrics", exp: 8, rating: 4.7, reviews: 156 },
];

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
const UNAVAILABLE = ["09:00", "12:00", "16:00"];

const STEPS = ["Speciality", "Doctor", "Date & Time", "Confirm"];

type BookingState = {
  specialty: typeof SPECIALTIES[0] | null;
  doctor: typeof DOCTORS[0] | null;
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? "text-ms-red" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-2 mb-5 ${done ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Calendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" });

  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <p className="text-sm font-bold text-ms-blue mb-4">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <span key={d} className="font-semibold text-slate-400 py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const date = new Date(year, month, day);
          const isSelected = selected?.getDate() === day && selected?.getMonth() === month;
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function BookPage() {
  const { user } = useAuth();
  const { loading } = useRequireAuth("/book");
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [ref, setRef] = useState("");
  const [booking, setBooking] = useState<BookingState>({
    specialty: null,
    doctor: null,
    date: null,
    time: null,
    paymentMethod: "Chapa",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  const handleConfirm = () => {
    setRef(`MSC-${Math.floor(100000 + Math.random() * 900000)}`);
    setConfirmed(true);
  };

  if (confirmed && booking.doctor && booking.specialty && booking.date && booking.time) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-[#F4F6FB] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white">
            <div className="bg-gradient-to-br from-ms-blue to-ms-blue-mid px-8 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                ["Date", formatDate(booking.date)],
                ["Time", formatTime(booking.time)],
                ["Fee", "ETB 800"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-ms-blue">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-8 pb-8 space-y-3">
              <Link href="/portal" className="block w-full rounded-xl bg-ms-blue py-3 text-center text-sm font-bold text-white hover:bg-ms-blue-mid transition-colors">
                View in Portal
              </Link>
              <button type="button" onClick={() => { setConfirmed(false); setStep(1); setBooking({ specialty: null, doctor: null, date: null, time: null, paymentMethod: "Chapa" }); }}
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
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
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-ms-blue mb-6 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Back to home
          </Link>

          <h1 className="text-3xl font-bold text-ms-blue" style={{ fontFamily: "Merriweather, Georgia, serif" }}>
            Book an Appointment
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">
            Hello, {user?.displayName ?? "there"}. Let&apos;s get you scheduled.
          </p>

          <StepIndicator current={step} />

          {/* Step 1 — Speciality */}
          {step === 1 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-ms-blue mb-6">Choose a Speciality</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SPECIALTIES.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => { setBooking((b) => ({ ...b, specialty: sp })); setStep(2); }}
                    className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 p-5 text-left hover:border-ms-blue/40 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{sp.icon}</span>
                    <div>
                      <p className="font-bold text-ms-blue group-hover:text-ms-red transition-colors">{sp.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sp.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Doctor */}
          {step === 2 && booking.specialty && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-ms-blue">Select Your Doctor</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Available {booking.specialty.name} specialists</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-ms-blue">← Back</button>
              </div>
              <div className="space-y-3">
                {DOCTORS.filter((d) => d.specialty === booking.specialty!.id).length === 0 ? (
                  DOCTORS.slice(0, 1).map((doc) => (
                    <DoctorCard key={doc.id} doc={doc} onSelect={() => { setBooking((b) => ({ ...b, doctor: doc })); setStep(3); }} />
                  ))
                ) : (
                  DOCTORS.filter((d) => d.specialty === booking.specialty!.id).map((doc) => (
                    <DoctorCard key={doc.id} doc={doc} onSelect={() => { setBooking((b) => ({ ...b, doctor: doc })); setStep(3); }} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3 — Date & Time */}
          {step === 3 && (
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-ms-blue">Pick a Date & Time</h2>
                <button type="button" onClick={() => setStep(2)} className="text-sm text-slate-400 hover:text-ms-blue">← Back</button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Calendar
                  selected={booking.date}
                  onSelect={(d) => setBooking((b) => ({ ...b, date: d, time: null }))}
                />
                <div>
                  <p className="text-sm font-bold text-ms-blue mb-4">
                    {booking.date
                      ? `Available Times · ${booking.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Available Times"}
                  </p>
                  {!booking.date ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                      Select a date to see available slots.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((t) => {
                        const unavailable = UNAVAILABLE.includes(t);
                        const selected = booking.time === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setBooking((b) => ({ ...b, time: t }))}
                            className={`rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                              selected
                                ? "bg-ms-red text-white"
                                : unavailable
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                  : "border border-slate-200 hover:border-ms-blue text-slate-700"
                            }`}
                          >
                            {formatTime(t)}
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
          {step === 4 && booking.doctor && booking.specialty && booking.date && booking.time && (
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-ms-blue">Confirm Appointment</h2>
                  <button type="button" onClick={() => setStep(3)} className="text-sm text-slate-400 hover:text-ms-blue">← Back</button>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-ms-blue/10 flex items-center justify-center text-xl">👨‍⚕️</div>
                  <div>
                    <p className="font-bold text-ms-blue">{booking.doctor.name}</p>
                    <p className="text-xs text-slate-400">{booking.specialty.name} · ★ {booking.doctor.rating}</p>
                  </div>
                </div>
                {[
                  ["Patient", user?.fullName ?? user?.displayName ?? "—"],
                  ["Patient ID", `MSC-${Math.floor(10000 + Math.random() * 90000)}`],
                  ["Date", formatDate(booking.date)],
                  ["Time", formatTime(booking.time)],
                  ["Location", "Bole Road, Addis Ababa"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-semibold text-ms-blue">{v}</span>
                  </div>
                ))}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-green-600">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Your appointment data is encrypted and secure
                </p>
              </div>

              <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
                <h2 className="text-lg font-bold text-ms-blue mb-6">Payment</h2>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between text-slate-500"><span>Consultation fee</span><span>ETB 800</span></div>
                  <div className="flex justify-between text-slate-500"><span>Service fee</span><span>ETB 40</span></div>
                  <div className="flex justify-between font-bold text-ms-blue pt-2 border-t"><span>Total</span><span>ETB 840</span></div>
                </div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">Pay With</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {["Chapa", "Telebirr", "CBE Birr", "Bank"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBooking((b) => ({ ...b, paymentMethod: m }))}
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
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full rounded-xl bg-ms-red py-3.5 text-sm font-bold text-white hover:bg-ms-red-dark transition-colors"
                >
                  Pay ETB 840 & Confirm →
                </button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-green-600">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
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

function DoctorCard({ doc, onSelect }: { doc: typeof DOCTORS[0]; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-5 hover:border-ms-blue/40 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-ms-blue/10 flex items-center justify-center text-lg">👨‍⚕️</div>
        <div>
          <p className="font-bold text-ms-blue">{doc.name}</p>
          <p className="text-xs text-slate-400">{doc.specialtyLabel} · {doc.exp} yrs exp.</p>
          <p className="text-xs text-amber-500 mt-0.5">★ {doc.rating} ({doc.reviews} reviews)</p>
        </div>
      </div>
      <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[10px] font-bold text-green-600 uppercase">
        Available
      </span>
    </button>
  );
}
