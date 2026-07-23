'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { resolveLocale } from '@/lib/i18n-utils';
import { getLocalizedPath } from '@/lib/locale-routing';

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
  const localize = (href: string) => getLocalizedPath(locale, href);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">Loading dashboard…</p>
      </div>
    );
  }

  const role = (user.role || 'patient').toLowerCase();

  if (role === 'patient') {
    return <PatientDashboardView displayName={user.fullName ?? user.displayName} localize={localize} />;
  }

  if (role === 'doctor' || role === 'admin') {
    return (
      <DoctorDashboardView
        doctorId={user.doctorId}
        isAdmin={role === 'admin'}
        displayName={user.fullName ?? user.displayName}
        localize={localize}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
      <p className="text-slate-500 text-sm">Unsupported role: {user.role}</p>
    </div>
  );
}

/* ───────────────────────── Patient Portal ───────────────────────── */

function PatientDashboardView({
  displayName,
  localize,
}: {
  displayName: string;
  localize: (href: string) => string;
}) {
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
            Patient Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">Welcome back, {displayName}.</p>

          <div className="flex gap-3 mb-8">
            <Link
              href={localize('/book')}
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
  items: PatientAppointment[];
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

/* ───────────────────────── Doctor / Admin Portal ───────────────────────── */

function DoctorDashboardView({
  doctorId: sessionDoctorId,
  isAdmin,
  displayName,
  localize,
}: {
  doctorId: string | null;
  isAdmin: boolean;
  displayName: string;
  localize: (href: string) => string;
}) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [doctorId, setDoctorId] = useState<string>(sessionDoctorId ?? '');
  const [message, setMessage] = useState('');

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
    if (!doctorId) {
      alert('Doctor ID not found in session.');
      return;
    }

    try {
      const res = await fetch('/api/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...slotData,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Availability slot opened successfully!');
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
        <p className="text-slate-500 text-sm">Loading doctor portal…</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-ms-red">Care Team Workspace</p>
              <h1
                className="mt-2 text-3xl font-bold text-ms-blue"
                style={{ fontFamily: 'Merriweather, Georgia, serif' }}
              >
                {isAdmin ? 'Admin / Doctor Portal' : 'Doctor Portal'}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Welcome back, {displayName}. Review patient requests and manage your working availability.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Link
                  href={localize('/dashboard/admin/doctors')}
                  className="rounded-full bg-ms-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15308d] transition-colors"
                >
                  Manage Doctors
                </Link>
              )}
              <Link
                href={localize('/doctors')}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-ms-blue/30 hover:text-ms-blue transition-colors"
              >
                Browse Directory
              </Link>
            </div>
          </div>

          {!doctorId && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              No doctor profile is linked to this account.
              {isAdmin
                ? ' You can still manage doctors via the admin panel above.'
                : ' Please contact an administrator.'}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 h-fit">
              <h2 className="text-lg font-bold text-ms-blue mb-4">Open Working Slot</h2>
              <form onSubmit={handleAddAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date</label>
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
                    <label className="block text-sm font-medium text-slate-700">Start Time</label>
                    <input
                      type="time"
                      required
                      value={slotData.startTime}
                      onChange={(e) => setSlotData({ ...slotData, startTime: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">End Time</label>
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
                  {doctorId ? 'Add Slot' : 'Link Doctor Profile to Add Slot'}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Your Open Slots
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {schedules.filter((s) => s.status !== 'booked').length === 0 ? (
                    <p className="text-xs text-slate-400">No open slots available.</p>
                  ) : (
                    schedules
                      .filter((s) => s.status !== 'booked')
                      .map((slot) => (
                        <div key={slot.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs flex justify-between gap-3">
                          <span>{new Date(slot.appointmentDate).toLocaleDateString()}</span>
                          <span className="font-semibold text-ms-blue">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col gap-1 mb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ms-blue">Patient Appointments Queue</h2>
                  <p className="text-sm text-slate-500">Approve or decline pending requests from booked patients.</p>
                </div>
              </div>

              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-slate-400 text-sm py-8 text-center">
                    No bookings found for this doctor profile.
                  </p>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-ms-blue">
                          {apt.patient?.firstNameEn || 'Patient'} {apt.patient?.lastNameEn || ''}
                        </p>
                        <p className="text-xs text-slate-500">
                          Date: {new Date(apt.appointmentDate).toLocaleDateString()} | Time: {apt.startTime} - {apt.endTime}
                        </p>
                        <p className="text-xs text-slate-400">Email: {apt.patient?.email || 'N/A'}</p>
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
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                              className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                            >
                              Reject
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
