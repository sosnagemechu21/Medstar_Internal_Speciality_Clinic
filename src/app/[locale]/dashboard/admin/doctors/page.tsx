'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    adminWorkspace: 'Admin Workspace',
    adminDesc: 'Create doctor accounts, manage doctor profiles, assign specialties, and maintain clinical roster.',
    doctorPortal: 'Doctor Portal',
    viewDirectory: 'View Public Directory',
    viewAppointments: 'View Appointments',
    rosterTitle: 'Doctors Roster & Profiles',
    rosterDesc: 'Manage existing doctors. Click edit or remove icon to modify profile.',
    registered: 'Doctors Registered',
    loadingRoster: 'Loading doctors roster…',
    noDoctors: 'No doctors registered yet.',
    yearsExp: 'Years Exp.',
    editProfile: 'Edit Doctor Profile',
    removeProfile: 'Remove Doctor Profile',
    onboardTitle: 'Onboard New Doctor',
    onboardDesc: 'Provide the login credentials, profile details, and specialty assignment for the new doctor account.',
    emailLabel: 'Email Address (Login)',
    passwordLabel: 'Temporary Password',
    firstNameEn: 'First Name (English)',
    lastNameEn: 'Last Name (English)',
    firstNameAm: 'First Name (Amharic)',
    lastNameAm: 'Last Name (Amharic)',
    specialty: 'Specialty',
    experience: 'Experience (Years)',
    photo: 'Doctor Photo (Optional)',
    photoHint: 'Upload from your device. JPG, PNG, or WEBP recommended.',
    bioEn: 'Bio (English)',
    bioAm: 'Bio (Amharic)',
    registering: 'Registering Doctor...',
    createBtn: 'Create Doctor Profile & Login',
    checklist: 'Admin Checklist',
    check1: 'Use a unique email for each doctor account. This becomes the login identifier.',
    check2: 'Assign the correct specialty so the doctor appears in the booking flow and directory.',
    check3: 'After creation, verify the doctor can access the Doctor Portal and manage availability slots.',
    deleteConfirmTitle: 'Are you sure to delete?',
    deleteConfirmDesc: 'This will clear their profile and open slots.',
    cancel: 'Cancel',
    yesDelete: 'Yes, Delete',
    saveChanges: 'Save Changes',
    loadingAdmin: 'Loading admin workspace…',
    defaultBio: 'Senior clinical practitioner at Medstar Specialty Clinic.',
    general: 'General',
  },
  am: {
    administration: 'አስተዳደር',
    adminWorkspace: 'የአስተዳዳሪ ሥራ ቦታ',
    adminDesc: 'የዶክተር መለያ ይፍጠሩ፣ የዶክተር ፕሮፋይል ያስተዳድሩ፣ ስፔሻሊቲ ያዋቅሩ እና ክሊኒካዊ ቡድን ያዘምኑ።',
doctorPortal: 'የዶክተር ፖርታል',
    viewDirectory: 'የህዝብ ማውጫ ይመልከቱ',
    viewAppointments: 'ቀጠሮዎችን ይመልከቱ',
    rosterTitle: 'የዶክተሮች ዝርዝር እና ፕሮፋይሎች',
    rosterDesc: 'ያሉ ዶክተሮችን ያስተዳድሩ። ፕሮፋይልን ለማስተካከል የአርትዕ ወይም ማስወገድ አዶ ይጫኑ።',
    registered: 'ዶክተሮች ተመዝግበዋል',
    loadingRoster: 'የዶክተሮች ዝርዝር በመጫን ላይ…',
    noDoctors: 'እስካሁን ምንም ዶክተር አልተመዘገበም።',
    yearsExp: 'ዓመት ልምድ',
    editProfile: 'የዶክተር ፕሮፋይል አርትዕ',
    removeProfile: 'የዶክተር ፕሮፋይል አስወግድ',
    onboardTitle: 'አዲስ ዶክተር ያስመዝግቡ',
    onboardDesc: 'ለአዲሱ ዶክተር መለያ የመግቢያ ምስክርነት፣ የፕሮፋይል ዝርዝሮች እና የስፔሻሊቲ ምደባ ያቅርቡ።',
    emailLabel: 'ኢሜይል አድራሻ (መግቢያ)',
    passwordLabel: 'ጊዜያዊ ፓስወርድ',
    firstNameEn: 'ስም (እንግሊዝኛ)',
    lastNameEn: 'የአባት ስም (እንግሊዝኛ)',
    firstNameAm: 'ስም (አማርኛ)',
    lastNameAm: 'የአባት ስም (አማርኛ)',
    specialty: 'ስፔሻሊቲ',
    experience: 'ልምድ (ዓመታት)',
    photo: 'የዶክተር ፎቶ (አማራጭ)',
    photoHint: 'ከመሣሪያዎ ይስቀሉ። JPG፣ PNG ወይም WEBP ይመከራል።',
    bioEn: 'ስለ ዶክተር (እንግሊዝኛ)',
    bioAm: 'ስለ ዶክተር (አማርኛ)',
    registering: 'ዶክተር በመመዝገብ ላይ...',
    createBtn: 'የዶክተር ፕሮፋይል እና መግቢያ ፍጠር',
    checklist: 'የአስተዳዳሪ ማረጋገጫ ዝርዝር',
    check1: 'ለእያንዳንዱ ዶክተር መለያ ልዩ ኢሜይል ይጠቀሙ። ይህ የመግቢያ ማስታወቂያ ይሆናል።',
    check2: 'ትክክለኛውን ስፔሻሊቲ ያዋቅሩ ዶክተሩ በቦኪንግ ፍሰት እና ማውጫ ውስጥ እንዲታይ።',
    check3: 'ከተፈጠረ በኋላ ዶክተሩ የዶክተር ፖርታልን ማግኘት እና የተገኝነት ቦታዎችን ማስተዳደር እንደሚችል ያረጋግጡ።',
    deleteConfirmTitle: 'ለመሰረዝ እርግጠኛ ነዎት?',
    deleteConfirmDesc: 'ይህ ፕሮፋይላቸውን እና ክፍት ቦታዎችን ያጸዳል።',
    cancel: 'ይቅር',
    yesDelete: 'አዎ፣ ሰርዝ',
    saveChanges: 'ለውጦችን አስቀምጥ',
    loadingAdmin: 'የአስተዳዳሪ ሥራ ቦታ በመጫን ላይ…',
    defaultBio: 'በሜድስታር ስፔሻሊቲ ክሊኒክ ውስጥ ከፍተኛ ክሊኒካዊ ባለሙያ።',
    general: 'ጠቅላላ',
  },
} as const;

export interface DoctorRecord {
  id: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAm: string | null;
  lastNameAm: string | null;
  experienceYears: number;
  photoUrl: string | null;
  bioEn: string | null;
  bioAm: string | null;
  specialty?: {
    id: string;
    nameEn: string;
    nameAm: string;
  };
  user?: {
    email: string | null;
    phoneNumber: string | null;
  };
}

export default function AdminDoctorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = resolveLocale(typeof params.locale === 'string' ? params.locale : undefined);
  const localize = useCallback((href: string) => getLocalizedPath(locale, href), [locale]);
  const { loading: authLoading } = useRequireAuth(localize('/dashboard/admin/doctors'));
  const L = t[locale];
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  // Roster & Modals state
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
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

  // Onboard Form state
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

  const loadDoctorsRoster = useCallback(async () => {
    try {
      setRosterLoading(true);
      const res = await fetch('/api/admin/doctors');
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors roster:', err);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role.toLowerCase() !== 'admin') {
      router.replace(localize('/dashboard'));
      return;
    }
    loadDoctorsRoster();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, loadDoctorsRoster]);

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
        loadDoctorsRoster();
      } else {
        setMessage(`Error: ${data.error || 'Failed to create doctor'}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (doc: DoctorRecord) => {
    setEditingDoctor(doc);
    setEditFormData({
      firstNameEn: doc.firstNameEn,
      lastNameEn: doc.lastNameEn,
      firstNameAm: doc.firstNameAm || '',
      lastNameAm: doc.lastNameAm || '',
      specialtyName: doc.specialty?.nameEn || '',
      experienceYears: doc.experienceYears || 1,
      bioEn: doc.bioEn || '',
      bioAm: doc.bioAm || '',
      photoDataUrl: '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      const res = await fetch(`/api/admin/doctors/${editingDoctor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`Doctor Dr. ${editFormData.firstNameEn} ${editFormData.lastNameEn} updated successfully!`);
        setEditingDoctor(null);
        loadDoctorsRoster();
      } else {
        alert(data.error || 'Failed to update doctor profile');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating doctor profile');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoctor) return;

    try {
      const res = await fetch(`/api/admin/doctors/${deletingDoctor.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`Doctor Dr. ${deletingDoctor.firstNameEn} ${deletingDoctor.lastNameEn} removed successfully!`);
        setDeletingDoctor(null);
        loadDoctorsRoster();
      } else {
        alert(data.error || 'Failed to remove doctor');
      }
    } catch (err: any) {
      alert(err.message || 'Error removing doctor');
    }
  };

  if (authLoading || !user || user.role.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <p className="text-slate-500 text-sm">{L.loadingAdmin}</p>
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
                  {L.adminWorkspace}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {L.adminDesc}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
<Link
                  href={localize('/dashboard')}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-ms-blue/30 hover:text-ms-blue"
                >
                  {L.doctorPortal}
                </Link>
                <Link
                  href={localize('/dashboard/admin/appointments')}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-ms-blue/30 hover:text-ms-blue"
                >
                  {L.viewAppointments}
                </Link>
                <Link
                  href={localize('/doctors')}
                  className="rounded-full bg-ms-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#15308d]"
                >
                  {L.viewDirectory}
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

          {/* Roster Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ms-blue">{L.rosterTitle}</h2>
                <p className="text-sm text-slate-500">{L.rosterDesc}</p>
              </div>
              <span className="rounded-full bg-ms-blue/10 px-3 py-1 text-xs font-bold text-ms-blue">
                {doctors.length} {L.registered}
              </span>
            </div>

            {rosterLoading ? (
              <p className="text-xs text-slate-400 py-6 text-center">{L.loadingRoster}</p>
            ) : doctors.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">{L.noDoctors}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <div key={doc.id} className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs flex flex-col justify-between group hover:border-ms-blue/40 transition-colors">
                    <div className="flex items-start gap-3">
                      {doc.photoUrl ? (
                        <img src={doc.photoUrl} alt={`Dr. ${doc.firstNameEn}`} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ms-blue/10 text-lg">👨‍⚕️</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ms-blue text-sm">
                          Dr. {doc.firstNameEn} {doc.lastNameEn}
                        </p>
                        <p className="text-xs font-semibold text-ms-red uppercase tracking-wider">
                          {(locale === 'am' ? doc.specialty?.nameAm : doc.specialty?.nameEn) || L.general}
                        </p>
                        {doc.user?.email && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.user.email}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {(locale === 'am' ? (doc.bioAm || doc.bioEn) : doc.bioEn) || L.defaultBio}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {doc.experienceYears} {L.yearsExp}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => startEditing(doc)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-ms-blue/10 hover:text-ms-blue transition-colors"
                          title={L.editProfile}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingDoctor(doc)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title={L.removeProfile}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-ms-blue">{L.onboardTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {L.onboardDesc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label={L.emailLabel}>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label={L.passwordLabel}>
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
                  <Field label={L.firstNameEn}>
                    <input
                      type="text"
                      name="firstNameEn"
                      required
                      value={formData.firstNameEn}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label={L.lastNameEn}>
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
                  <Field label={L.firstNameAm}>
                    <input
                      type="text"
                      name="firstNameAm"
                      value={formData.firstNameAm}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label={L.lastNameAm}>
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
                  <Field label={L.specialty}>
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
                  <Field label={L.experience}>
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

                <Field label={L.photo}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {L.photoHint}
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
                  <Field label={L.bioEn}>
                    <textarea
                      name="bioEn"
                      rows={4}
                      value={formData.bioEn}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-ms-blue/40"
                    />
                  </Field>
                  <Field label={L.bioAm}>
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
                  {loading ? L.registering : L.createBtn}
                </button>
              </form>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-ms-blue">{L.checklist}</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  {L.check1}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  {L.check2}
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  {L.check3}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </main>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-ms-blue">
                {L.editProfile}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Field label={L.firstNameEn}>
                  <input
                    type="text"
                    required
                    value={editFormData.firstNameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, firstNameEn: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs outline-none focus:border-ms-blue/40"
                  />
                </Field>
                <Field label={L.lastNameEn}>
                  <input
                    type="text"
                    required
                    value={editFormData.lastNameEn}
                    onChange={(e) => setEditFormData({ ...editFormData, lastNameEn: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs outline-none focus:border-ms-blue/40"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={L.specialty}>
                  <input
                    type="text"
                    required
                    value={editFormData.specialtyName}
                    onChange={(e) => setEditFormData({ ...editFormData, specialtyName: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs outline-none focus:border-ms-blue/40"
                  />
                </Field>
                <Field label={L.experience}>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.experienceYears}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs outline-none focus:border-ms-blue/40"
                  />
                </Field>
              </div>

              <Field label={L.bioEn}>
                <textarea
                  rows={3}
                  value={editFormData.bioEn}
                  onChange={(e) => setEditFormData({ ...editFormData, bioEn: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xs outline-none focus:border-ms-blue/40"
                />
              </Field>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {L.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ms-blue px-5 py-2 text-xs font-bold text-white hover:bg-ms-blue-mid transition-colors shadow-sm"
                >
                  {L.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Doctor Confirmation Popup Modal */}
      {deletingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">{L.deleteConfirmTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Dr. {locale === 'am' ? (deletingDoctor.firstNameAm || deletingDoctor.firstNameEn) : deletingDoctor.firstNameEn} {locale === 'am' ? (deletingDoctor.lastNameAm || deletingDoctor.lastNameEn) : deletingDoctor.lastNameEn} — {L.deleteConfirmDesc}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoctor(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {L.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-full bg-ms-red px-5 py-2 text-xs font-bold text-white hover:bg-ms-red-dark transition-colors shadow-sm"
              >
                {L.yesDelete}
              </button>
            </div>
          </div>
        </div>
      )}
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