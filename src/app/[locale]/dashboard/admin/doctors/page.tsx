'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { resolveLocale } from '@/lib/i18n-utils';
import { getLocalizedPath } from '@/lib/locale-routing';

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === 'string' ? params.locale : undefined);
  const localize = (href: string) => getLocalizedPath(locale, href);
  const { loading: authLoading } = useRequireAuth(localize('/dashboard/admin/doctors'));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstNameEn: '',
    lastNameEn: '',
    firstNameAm: '',
    lastNameAm: '',
    specialtyName: '',
    experienceYears: 1,
    bioEn: '',
    bioAm: '',
    photoDataUrl: '',
  });

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role.toLowerCase() !== 'admin') {
      router.replace(localize('/dashboard'));
    }
  }, [authLoading, localize, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview('');
      setFormData((prev) => ({ ...prev, photoDataUrl: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setPhotoPreview(dataUrl);
      setFormData((prev) => ({ ...prev, photoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('Doctor successfully created and credentials generated!');
        setFormData({
          email: '',
          password: '',
          firstNameEn: '',
          lastNameEn: '',
          firstNameAm: '',
          lastNameAm: '',
          specialtyName: '',
          experienceYears: 1,
          bioEn: '',
          bioAm: '',
          photoDataUrl: '',
        });
        setPhotoPreview('');
      } else {
        setMessage(`Error: ${data.error || 'Failed to create doctor'}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">Loading admin workspace…</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F4F6FB] pt-16">
        <Container className="py-10 space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-ms-red">Administration</p>
                <h1
                  className="mt-2 text-3xl font-bold text-ms-blue"
                  style={{ fontFamily: 'Merriweather, Georgia, serif' }}
                >
                  Admin Workspace
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Create doctor accounts, assign specialties, and keep the care team roster up to date.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={localize('/dashboard')}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-ms-blue/30 hover:text-ms-blue"
                >
                  Doctor Portal
                </Link>
                <Link
                  href={localize('/doctors')}
                  className="rounded-full bg-ms-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#15308d]"
                >
                  View Public Directory
                </Link>
              </div>
            </div>
          </div>

          {message && (
            <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
              message.startsWith('Error')
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-ms-blue">Onboard New Doctor</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Provide the login credentials, profile details, and specialty assignment for the new doctor account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Email Address (Login)">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label="Temporary Password">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="First Name (English)">
                    <input
                      type="text"
                      name="firstNameEn"
                      required
                      value={formData.firstNameEn}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label="Last Name (English)">
                    <input
                      type="text"
                      name="lastNameEn"
                      required
                      value={formData.lastNameEn}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="First Name (Amharic)">
                    <input
                      type="text"
                      name="firstNameAm"
                      value={formData.firstNameAm}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label="Last Name (Amharic)">
                    <input
                      type="text"
                      name="lastNameAm"
                      value={formData.lastNameAm}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Specialty">
                    <input
                      type="text"
                      name="specialtyName"
                      required
                      value={formData.specialtyName}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology"
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label="Experience (Years)">
                    <input
                      type="number"
                      name="experienceYears"
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                </div>

                <Field label="Doctor Photo (Optional)">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Upload from your device. JPG, PNG, or WEBP recommended.
                  </p>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Doctor preview"
                      className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
                    />
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Bio (English)">
                    <textarea
                      name="bioEn"
                      rows={4}
                      value={formData.bioEn}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label="Bio (Amharic)">
                    <textarea
                      name="bioAm"
                      rows={4}
                      value={formData.bioAm}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-ms-red px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ms-red-dark disabled:opacity-50"
                >
                  {loading ? 'Registering Doctor...' : 'Create Doctor Profile & Login'}
                </button>
              </form>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-ms-blue">Admin Checklist</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  Use a unique email for each doctor account. This becomes the login identifier.
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  Assign the correct specialty so the doctor appears in the booking flow and directory.
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  After creation, verify the doctor can access the Doctor Portal and manage availability slots.
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}