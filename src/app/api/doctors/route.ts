import { NextRequest, NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

import { getLocalizedField, resolveLocale } from '@/lib/i18n-utils';
import { prisma } from '@/lib/prisma';

function getDoctorDisplayName(doctor: Record<string, unknown>, locale: 'en' | 'am'): string {
  return [
    getLocalizedField(doctor, 'firstName', locale),
    getLocalizedField(doctor, 'lastName', locale),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const locale = resolveLocale(
      request.nextUrl.searchParams.get('locale'),
      await getLocale().catch(() => undefined)
    );
    const specialtyId = request.nextUrl.searchParams.get('specialtyId') ?? undefined;
    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';

    const doctors = await prisma.doctor.findMany({
      where: {
        ...(specialtyId ? { specialtyId } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        specialty: true,
      },
      orderBy: [{ firstNameEn: 'asc' }, { lastNameEn: 'asc' }],
    });

    return NextResponse.json({
      locale,
      data: doctors.map((doctor) => ({
        id: doctor.id,
        firstName: getLocalizedField(doctor, 'firstName', locale),
        lastName: getLocalizedField(doctor, 'lastName', locale),
        name: getDoctorDisplayName(doctor, locale),
        title: getLocalizedField(doctor.specialty, 'name', locale),
        bio: getLocalizedField(doctor, 'bio', locale),
        isActive: doctor.isActive,
        specialtyId: doctor.specialtyId,
        specialty: {
          id: doctor.specialty.id,
          name: getLocalizedField(doctor.specialty, 'name', locale),
          description: getLocalizedField(doctor.specialty, 'description', locale),
        },
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}