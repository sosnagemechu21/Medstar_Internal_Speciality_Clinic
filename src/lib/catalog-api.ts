import type { Locale } from '../../i18n.config';

export type SpecialtyListItem = {
  id: string;
  name: string;
  title?: string;
  description: string;
  doctorCount: number;
};

export type DoctorListItem = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  title: string;
  bio: string;
  isActive: boolean;
  specialtyId: string;
  specialty: {
    id: string;
    name: string;
    description: string;
  };
};

async function fetchJson<T>(input: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(input, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchSpecialties(
  locale: Locale,
  signal?: AbortSignal
): Promise<SpecialtyListItem[]> {
  const searchParams = new URLSearchParams({ locale });
  const response = await fetchJson<{ data: SpecialtyListItem[] }>(
    `/api/specialties?${searchParams.toString()}`,
    signal
  );

  return response.data;
}

export async function fetchDoctors(
  locale: Locale,
  options?: {
    specialtyId?: string;
    signal?: AbortSignal;
  }
): Promise<DoctorListItem[]> {
  const searchParams = new URLSearchParams({ locale });

  if (options?.specialtyId) {
    searchParams.set('specialtyId', options.specialtyId);
  }

  const response = await fetchJson<{ data: DoctorListItem[] }>(
    `/api/doctors?${searchParams.toString()}`,
    options?.signal
  );

  return response.data.map((doctor) => ({
    ...doctor,
    title: doctor.title || doctor.specialty.name,
  }));
}