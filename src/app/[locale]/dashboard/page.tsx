'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { resolveLocale } from '@/lib/i18n-utils';
import { getLocalizedPath } from '@/lib/locale-routing';
import type { Locale } from '../../../../i18n.config';

const t = {
  en: {
    loadingDashboard: 'Loading dashboard…',
    unsupportedRole: 'Unsupported role:',
    patientPortal: 'Patient Portal',
    welcomeBack: 'Welcome back,',
    bookAppointment: 'Book Appointment',
    upcomingAppointments: 'Upcoming Appointments',
    pastAppointments: 'Past Appointments',
    noUpcoming: 'No upcoming appointments.',
    noPast: 'No past appointments.',
    loading: 'Loading…',
    doctor: 'Dr.',
    date: 'Date',
    time: 'Time',
    email: 'Email',
    loadingDoctorPortal: 'Loading doctor portal…',
    careTeamWorkspace: 'Care Team Workspace',
    adminDoctorPortal: 'Admin / Doctor Portal',
    doctorPortalOnly: 'Doctor Portal',
    welcomeDoctor1: 'Welcome back, ',
    welcomeDoctor2: '. Review patient requests and manage your working availability.',
    manageDoctors: 'Manage Doctors',
    browseDirectory: 'Browse Directory',
    noProfileLinked: 'No doctor profile is linked to this account.',
    canManageAdmin: ' You can still manage doctors via the admin panel above.',
    contactAdmin: ' Please contact an administrator.',
    openWorkingSlot: 'Open Working Slot',
    startTime: 'Start Time',
    endTime: 'End Time',
    addSlot: 'Add Slot',
    linkDoctorProfile: 'Link Doctor Profile to Add Slot',
    yourOpenSlots: 'Your Open Slots',
    noOpenSlots: 'No open slots available.',
    areYouSure: 'Are you sure to delete?',
    eraseSlotWarning: 'This will erase this open slot from your availability schedule.',
    cancel: 'Cancel',
    yesDelete: 'Yes, Delete',
    patientQueue: 'Patient Appointments Queue',
    approveDecline: 'Approve or decline pending requests from booked patients.',
    noBookings: 'No bookings found for this doctor profile.',
    accept: 'Accept',
    reject: 'Reject',
    patient: 'Patient',
  },
  am: {
    loadingDashboard: 'ዳሽቦርድ በመጫን ላይ…',
    unsupportedRole: 'ያልተደገፈ ሚና:',
    patientPortal: 'የታካሚ ፖርታል',
    welcomeBack: 'እንኳን ደህና መጡ፣',
    bookAppointment: 'ቀጠሮ ይያዙ',
    upcomingAppointments: 'የሚቀጥሉ ቀጠሮዎች',
    pastAppointments: 'ያለፉ ቀጠሮዎች',
    noUpcoming: 'ምንም የሚመጡ ቀጠሮዎች የሉም።',
    noPast: 'ምንም ያለፉ ቀጠሮዎች የሉም።',
    loading: 'በመጫን ላይ…',
    doctor: 'ዶ/ር',
    date: 'ቀን',
    time: 'ሰዓት',
    email: 'ኢሜይል',
    loadingDoctorPortal: 'የዶክተር ፖርታል በመጫን ላይ…',
    careTeamWorkspace: 'የሕክምና ቡድን ሥራ ቦታ',
    adminDoctorPortal: 'አስተዳዳሪ / የዶክተር ፖርታል',
    doctorPortalOnly: 'የዶክተር ፖርታል',
    welcomeDoctor1: 'እንኳን ደህና መጡ፣ ',
    welcomeDoctor2: '። የታካሚ ጥያቄዎችን ይገምግሙ እና የስራ ሰዓትዎን ያስተዳድሩ።',
    manageDoctors: 'ዶክተሮችን ያስተዳድሩ',
    browseDirectory: 'ማውጫውን ያስሱ',
    noProfileLinked: 'ከዚህ መለያ ጋር የተገናኘ የዶክተር ፕሮፋይል የለም።',
    canManageAdmin: ' አሁንም ዶክተሮችን በአስተዳዳሪ ፓነል ማስተዳደር ይችላሉ።',
    contactAdmin: ' እባክዎ አስተዳዳሪን ያነጋግሩ።',
    openWorkingSlot: 'ክፍት የስራ ጊዜ ይመድቡ',
    startTime: 'የመጀመሪያ ሰዓት',
    endTime: 'የመጨረሻ ሰዓት',
    addSlot: 'ጊዜ አክል',
    linkDoctorProfile: 'ጊዜ ለመጨመር የዶክተር ፕሮፋይል ያገናኙ',
    yourOpenSlots: 'የእርስዎ ክፍት ጊዜዎች',
    noOpenSlots: 'ምንም ክፍት ጊዜ የለም።',
    areYouSure: 'ለመሰረዝ እርግጠኛ ነዎት?',
    eraseSlotWarning: 'ይህ ይህን ክፍት ጊዜ ከእርስዎ መርሃ ግብር ያጠፋዋል።',
    cancel: 'ይቅር',
    yesDelete: 'አዎ፣ ሰርዝ',
    patientQueue: 'የታካሚ ቀጠሮዎች ሰልፍ',
    approveDecline: 'የታካሚ ጥያቄዎችን ይቀበሉ ወይም ውድቅ ያድርጉ።',
    noBookings: 'ለዚህ የዶክተር ፕሮፋይል ምንም ቀጠሮ አልተገኘም።',
    accept: 'ተቀበል',
    reject: 'ውድቅ አድርግ',
    patient: 'ታካሚ',
  }
} as const;

interface PatientAppointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  status: string;
  doctor: { firstNameEn: string; lastNameEn: string };
}

interface DoctorAppointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  patient?: {
    firstNameEn?: string;
    lastNameEn?: string;
    email?: string;
    user?: {
      email?: string;
    };
  };
}

interface ScheduleSlot {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading } = useRequireAuth('/dashboard');
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === 'string' ? params.locale : undefined);
  const localize = useCallback((href: string) => getLocalizedPath(locale, href), [locale]);
  const L = t[locale];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">{L.loadingDashboard}</p>
      </div>
    );
  }

  const role = (user.role || 'patient').toLowerCase();

  // Admins now land on the patient/customer view (they access admin pages only by direct URL).
  // Only actual doctors get the doctor portal.
  if (role === 'doctor') {
    return (
      <DoctorDashboardView
        doctorId={user.doctorId}
        isAdmin={false}
        displayName={user.fullName ?? user.displayName}
        localize={localize}
        locale={locale}
      />
    );
  }

  // Patient view for everyone else (patients, admins).
  if (role === 'patient' || role === 'admin') {
    return <PatientDashboardView displayName={user.fullName ?? user.displayName} localize={localize} locale={locale} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
      <p className="text-slate-500 text-sm">{L.unsupportedRole} {user.role}</p>
    </div>
  );
}

/* ───────────────────────── Patient Portal ───────────────────────── */

function PatientDashboardView({
  displayName,
  localize,
  locale,
}: {
  displayName: string;
  localize: (href: string) => string;
  locale: Locale;
}) {
  const L = t[locale];
  const [upcoming, setUpcoming] = useState<PatientAppointment[]>([]);
  const [history, setHistory] = useState<PatientAppointment[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch('/api/patient/appointments', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setUpcoming(data.upcoming ?? []);
        setHistory(data.history ?? []);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB]">
        <Container className="py-10">
          <h1
            className="text-3xl font-bold text-ms-blue"
            style={{ fontFamily: 'Merriweather, Georgia, serif' }}
          >
            {L.patientPortal}
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">{L.welcomeBack} {displayName}.</p>

          <div className="flex gap-3 mb-8">
            <Link
              href={localize('/book')}
              className="rounded-full bg-ms-red px-6 py-2.5 text-sm font-bold text-white hover:bg-ms-red-dark transition-colors"
            >
              {L.bookAppointment}
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <AppointmentList
              title={L.upcomingAppointments}
              empty={L.noUpcoming}
              items={upcoming}
              fetching={fetching}
              locale={locale}
            />
            <AppointmentList
              title={L.pastAppointments}
              empty={L.noPast}
              items={history}
              fetching={fetching}
              locale={locale}
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
  locale,
}: {
  title: string;
  empty: string;
  items: PatientAppointment[];
  fetching: boolean;
  locale: Locale;
}) {
  const L = t[locale];
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <h2 className="text-base font-bold text-ms-blue mb-4">{title}</h2>
      {fetching ? (
        <p className="text-sm text-slate-400">{L.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-100 p-4">
<p className="font-semibold text-ms-blue text-sm">
                                {L.doctor} {a.doctor?.firstNameEn} {a.doctor?.lastNameEn}
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

/* ───────────────────────── Doctor / Admin Portal ───────────────────────── */

function DoctorDashboardView({
  doctorId: sessionDoctorId,
  isAdmin,
  displayName,
  localize,
  locale,
}: {
  doctorId: string | null;
  isAdmin: boolean;
  displayName: string;
  localize: (href: string) => string;
  locale: Locale;
}) {
  const L = t[locale];
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [doctorId, setDoctorId] = useState<string>(sessionDoctorId ?? '');
  const [message, setMessage] = useState('');
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  const confirmDeleteSlot = async () => {
    if (!deletingSlotId) return;
    try {
      const res = await fetch(`/api/doctor/availability?id=${deletingSlotId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Time slot erased successfully!');
        loadDashboardData();
      } else {
        setMessage(`Error: ${data.error || 'Failed to delete slot'}`);
      }
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to delete slot'}`);
    } finally {
      setDeletingSlotId(null);
    }
  };

  const [slotData, setSlotData] = useState({
    appointmentDate: '',
    startTime: '09:00',
    endTime: '10:00',
  });

  useEffect(() => {
    if (sessionDoctorId) {
      setDoctorId(sessionDoctorId);
    }
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDoctorId]);

  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/doctor/dashboard-data', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setDoctorId(data.doctorId ?? sessionDoctorId ?? '');
        setAppointments(data.appointments ?? []);
        setSchedules(data.schedules ?? []);
      } else {
        setDoctorId('');
        setAppointments([]);
        setSchedules([]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setDoctorId('');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      // doctorId is resolved on the server from session User → Doctor.userId (never User.id)
      const res = await fetch('/api/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appointmentDate: slotData.appointmentDate,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Availability slot opened successfully!');
        if (data.doctorId) setDoctorId(data.doctorId);
        loadDashboardData();
        setSlotData({ appointmentDate: '', startTime: '09:00', endTime: '10:00' });
      } else {
        setMessage(`Error: ${data.error || 'Failed to add slot'}`);
      }
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to add slot'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">{L.loadingDoctorPortal}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F4F6FB]">
        <Container className="py-10 space-y-8">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-ms-red">{L.careTeamWorkspace}</p>
              <h1
                className="mt-2 text-3xl font-bold text-ms-blue"
                style={{ fontFamily: 'Merriweather, Georgia, serif' }}
              >
                {isAdmin ? L.adminDoctorPortal : L.doctorPortalOnly}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                {L.welcomeDoctor1}{displayName}{L.welcomeDoctor2}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Link
                  href={localize('/dashboard/admin/doctors')}
                  className="rounded-full bg-ms-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15308d] transition-colors"
                >
                  {L.manageDoctors}
                </Link>
              )}
              <Link
                href={localize('/doctors')}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-ms-blue/30 hover:text-ms-blue transition-colors"
              >
                {L.browseDirectory}
              </Link>
            </div>
          </div>

          {!doctorId && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              {L.noProfileLinked}
              {isAdmin
                ? L.canManageAdmin
                : L.contactAdmin}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 h-fit">
              <h2 className="text-lg font-bold text-ms-blue mb-4">{L.openWorkingSlot}</h2>
              <form onSubmit={handleAddAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">{L.date}</label>
                  <input
                    type="date"
                    required
                    value={slotData.appointmentDate}
                    onChange={(e) => setSlotData({ ...slotData, appointmentDate: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{L.startTime}</label>
                    <input
                      type="time"
                      required
                      value={slotData.startTime}
                      onChange={(e) => setSlotData({ ...slotData, startTime: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">{L.endTime}</label>
                    <input
                      type="time"
                      required
                      value={slotData.endTime}
                      onChange={(e) => setSlotData({ ...slotData, endTime: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!doctorId}
                  className="w-full rounded-full bg-ms-red px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ms-red-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {doctorId ? L.addSlot : L.linkDoctorProfile}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  {L.yourOpenSlots}
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {schedules.filter((s) => s.status !== 'booked').length === 0 ? (
                    <p className="text-xs text-slate-400">{L.noOpenSlots}</p>
                  ) : (
                    schedules
                      .filter((s) => s.status !== 'booked')
                      .map((slot) => (
                        <div key={slot.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs flex justify-between gap-3 items-center">
                          <span>{new Date(slot.appointmentDate).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ms-blue">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDeletingSlotId(slot.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete Slot"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {deletingSlotId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-bold text-slate-900">{L.areYouSure}</h3>
                    <p className="text-xs text-slate-500 mt-1">{L.eraseSlotWarning}</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingSlotId(null)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {L.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteSlot}
                      className="rounded-full bg-ms-red px-5 py-2 text-xs font-bold text-white hover:bg-ms-red-dark transition-colors shadow-sm"
                    >
                      {L.yesDelete}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col gap-1 mb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ms-blue">{L.patientQueue}</h2>
                  <p className="text-sm text-slate-500">{L.approveDecline}</p>
                </div>
              </div>

              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-slate-400 text-sm py-8 text-center">
                    {L.noBookings}
                  </p>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-ms-blue">
                          {apt.patient?.firstNameEn || L.patient} {apt.patient?.lastNameEn || ''}
                        </p>
                        <p className="text-xs text-slate-500">
                          {L.date}: {new Date(apt.appointmentDate).toLocaleDateString()} | {L.time}: {apt.startTime} - {apt.endTime}
                        </p>
                        <p className="text-xs text-slate-400">{L.email}: {apt.patient?.user?.email || apt.patient?.email || 'N/A'}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {apt.status}
                        </span>

                        {apt.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                              className="rounded-full bg-green-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                            >
                              {L.accept}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                              className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                            >
                              {L.reject}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
