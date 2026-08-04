'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { resolveLocale } from '@/lib/i18n-utils';
import { getLocalizedPath } from '@/lib/locale-routing';

const t = {
  en: {
    administration: 'Administration',
    appointmentsTitle: 'All Appointments',
    appointmentsDesc: 'View every appointment across all doctors, filter by doctor or status.',
    backToPortal: 'Back to Portal',
    manageDoctors: 'Manage Doctors',
    loading: 'Loading appointments…',
    noAppointments: 'No appointments found.',
    allDoctors: 'All Doctors',
    allStatuses: 'All Statuses',
    doctor: 'Doctor',
    specialty: 'Specialty',
    patient: 'Patient',
    email: 'Email',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    fee: 'Fee',
    payment: 'Payment',
    total: 'Total Appointments',
    loadingDoctors: 'Loading doctors…',
    noDoctor: 'No doctor',
  },
  am: {
    administration: 'አስተዳደር',
    appointmentsTitle: 'ሁሉም ቀጠሮዎች',
    appointmentsDesc: 'ሁሉንም ቀጠሮዎች በዶክተር ወይም በሁኔታ አጣርተው ይመልከቱ።',
    backToPortal: 'ወደ ፖርታል ተመለስ',
    manageDoctors: 'ዶክተሮችን ያስተዳድሩ',
    loading: 'ቀጠሮዎች በመጫን ላይ…',
    noAppointments: 'ምንም ቀጠሮ አልተገኘም።',
    allDoctors: 'ሁሉም ዶክተሮች',
    allStatuses: 'ሁሉም ሁኔታዎች',
    doctor: 'ዶክተር',
    specialty: 'ስፔሻሊቲ',
    patient: 'ታካሚ',
    email: 'ኢሜይል',
    date: 'ቀን',
    time: 'ሰዓት',
    status: 'ሁኔታ',
    fee: 'ክፍያ',
    payment: 'መክፈያ',
    total: 'ጠቅላላ ቀጠሮዎች',
    loadingDoctors: 'ዶክተሮች በመጫን ላይ…',
    noDoctor: 'ዶክተር የለም',
  },
} as const;

interface AdminAppointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  doctor: {
    firstNameEn: string;
    lastNameEn: string;
    firstNameAm: string | null;
    lastNameAm: string | null;
    specialty: { nameEn: string; nameAm: string };
  };
  patient: {
    firstNameEn: string;
    lastNameEn: string;
    user?: { email?: string | null; phoneNumber?: string | null };
  };
  payment?: { amount: number; status: string; paymentMethod?: string } | null;
}

interface AdminDoctor {
  id: string;
  firstNameEn: string;
  lastNameEn: string;
  specialty?: { nameEn: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-purple-100 text-purple-800',
};

function formatDate(iso: string, locale: 'en' | 'am'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time: string, locale: 'en' | 'am'): string {
  const [hour, minute] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale === 'am' ? 'am-ET' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2026, 0, 1, hour, minute));
}

export default function AdminAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === 'string' ? params.locale : undefined);
  const localize = useCallback((href: string) => getLocalizedPath(locale, href), [locale]);
  const { loading: authLoading } = useRequireAuth(localize('/dashboard/admin/appointments'));
  const L = t[locale];

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role.toLowerCase() !== 'admin') {
      router.replace(localize('/dashboard'));
      return;
    }
    loadAppointments();
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, doctorId, status]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (doctorId) searchParams.set('doctorId', doctorId);
      if (status) searchParams.set('status', status);
      const res = await fetch(`/api/admin/appointments?${searchParams.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.appointments || []);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  if (authLoading || !user || user.role.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">{L.loading}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F4F6FB] pt-16 pb-16">
        <Container className="py-10 space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-ms-red">{L.administration}</p>
                <h1
                  className="mt-2 text-3xl font-bold text-ms-blue"
                  style={{ fontFamily: 'Merriweather, Georgia, serif' }}
                >
                  {L.appointmentsTitle}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{L.appointmentsDesc}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={localize('/dashboard')}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-ms-blue/30 hover:text-ms-blue"
                >
                  {L.backToPortal}
                </Link>
                <Link
                  href={localize('/dashboard/admin/doctors')}
                  className="rounded-full bg-ms-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#15308d]"
                >
                  {L.manageDoctors}
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">{L.doctor}</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                >
                  <option value="">{L.allDoctors}</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.firstNameEn} {doc.lastNameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{L.status}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                >
                  <option value="">{L.allStatuses}</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-ms-blue">{appointments.length}</span>
            <span>{L.total}</span>
          </div>

          {/* Appointments table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-xs text-slate-400 py-8 text-center">{L.loading}</p>
            ) : appointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">{L.noAppointments}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                      <th className="py-3 pr-4 font-semibold">{L.doctor}</th>
                      <th className="py-3 pr-4 font-semibold">{L.patient}</th>
                      <th className="py-3 pr-4 font-semibold">{L.date}</th>
                      <th className="py-3 pr-4 font-semibold">{L.time}</th>
                      <th className="py-3 pr-4 font-semibold">{L.status}</th>
                      <th className="py-3 font-semibold">{L.fee}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => {
                      const doctorName =
                        locale === 'am'
                          ? `Dr. ${apt.doctor.firstNameAm || apt.doctor.firstNameEn} ${apt.doctor.lastNameAm || apt.doctor.lastNameEn}`
                          : `Dr. ${apt.doctor.firstNameEn} ${apt.doctor.lastNameEn}`;
                      const patientName =
                        locale === 'am'
                          ? `${apt.patient.firstNameEn} ${apt.patient.lastNameEn}`
                          : `${apt.patient.firstNameEn} ${apt.patient.lastNameEn}`;
                      const specialtyName =
                        (locale === 'am' ? apt.doctor.specialty?.nameAm : apt.doctor.specialty?.nameEn) || '';
                      return (
                        <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-ms-blue">{doctorName}</p>
                            {specialtyName && <p className="text-xs text-slate-400">{specialtyName}</p>}
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-slate-700">{patientName}</p>
                            <p className="text-xs text-slate-400">{apt.patient.user?.email || '—'}</p>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{formatDate(apt.appointmentDate, locale)}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {formatTime(apt.startTime, locale)} - {formatTime(apt.endTime, locale)}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${STATUS_COLORS[apt.status] || 'bg-slate-100 text-slate-700'}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {apt.payment ? (
                              <div>
                                <p className="font-semibold text-slate-700">ETB {apt.payment.amount}</p>
                                <span className={`text-[10px] uppercase ${apt.payment.status === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                                  {apt.payment.status}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}
