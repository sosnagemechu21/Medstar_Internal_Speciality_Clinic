import { NextRequest, NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

import { getLocalizedField, resolveLocale } from '@/lib/i18n-utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    let doctors = await prisma.doctor.findMany({
      where: {
        ...(specialtyId ? { specialtyId } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        specialty: true,
      },
      orderBy: [{ firstNameEn: 'asc' }, { lastNameEn: 'asc' }],
    });

    if (doctors.length === 0) {
      let cardiology = await prisma.specialty.findFirst({
        where: { nameEn: { equals: 'Cardiology', mode: 'insensitive' } },
      });
      if (!cardiology) {
        cardiology = await prisma.specialty.create({
          data: {
            nameEn: 'Cardiology',
            nameAm: 'የልብ ሕክምና (Cardiology)',
            descriptionEn: 'Heart and cardiovascular system care.',
            descriptionAm: 'የልብ እና የደም ዝውውር ሥርዓት ሕክምና።',
          },
        });
      }

      let pediatrics = await prisma.specialty.findFirst({
        where: { nameEn: { equals: 'Pediatrics', mode: 'insensitive' } },
      });
      if (!pediatrics) {
        pediatrics = await prisma.specialty.create({
          data: {
            nameEn: 'Pediatrics',
            nameAm: 'የህጻናት ሕክምና (Pediatrics)',
            descriptionEn: 'Medical care for infants, children, and adolescents.',
            descriptionAm: 'ለሕፃናት፣ ለልጆች እና ለአቅመ አዳም ላልደረሱ ወጣቶች የሚሰጥ የሕክምና አገልግሎት።',
          },
        });
      }

      const bcrypt = await import('bcryptjs');

      // 1. Dawit Amare
      const passAmare = await bcrypt.hash('dawitamare@1234', 10);
      const userAmare = await prisma.user.create({
        data: {
          email: 'dawitamare@medstar.com',
          passwordHash: passAmare,
          role: 'doctor',
        },
      });
      await prisma.doctor.create({
        data: {
          userId: userAmare.id,
          specialtyId: cardiology.id,
          firstNameEn: 'Dawit',
          lastNameEn: 'Amare',
          firstNameAm: 'ዳዊት',
          lastNameAm: 'አማረ',
          experienceYears: 12,
          bioEn: 'Expert Cardiologist specializing in heart condition treatments.',
          bioAm: 'በልብ ህክምና ልዩ ባለሙያ ከ12 ዓመት በላይ ልምድ ያላቸው።',
        },
      });

      // 2. Dawit Abebe
      const passAbebe = await bcrypt.hash('dawitabebe@1234', 10);
      const userAbebe = await prisma.user.create({
        data: {
          email: 'dawitabebe@medstar.com',
          passwordHash: passAbebe,
          role: 'doctor',
        },
      });
      await prisma.doctor.create({
        data: {
          userId: userAbebe.id,
          specialtyId: cardiology.id,
          firstNameEn: 'Dawit',
          lastNameEn: 'Abebe',
          firstNameAm: 'ዳዊት',
          lastNameAm: 'አበበ',
          experienceYears: 10,
          bioEn: 'Senior Cardiologist with 10+ years of clinical practice.',
          bioAm: 'ከ10 ዓመት በላይ ክሊኒካዊ ልምድ ያላቸው ከፍተኛ የልብ ሐኪም።',
        },
      });

      // 3. Helen Tadesse
      const passHelen = await bcrypt.hash('helentadesse@1234', 10);
      const userHelen = await prisma.user.create({
        data: {
          email: 'helentadesse@medstar.com',
          passwordHash: passHelen,
          role: 'doctor',
        },
      });
      await prisma.doctor.create({
        data: {
          userId: userHelen.id,
          specialtyId: pediatrics.id,
          firstNameEn: 'Helen',
          lastNameEn: 'Tadesse',
          firstNameAm: 'ሄለን',
          lastNameAm: 'ታደሰ',
          experienceYears: 8,
          bioEn: 'Compassionate pediatrician specializing in neonatal health.',
          bioAm: 'በአራስ ሕፃናት ጤና ላይ ያተኮሩ አፍቃሪ የሕፃናት ሐኪም።',
        },
      });

      doctors = await prisma.doctor.findMany({
        where: {
          ...(specialtyId ? { specialtyId } : {}),
          ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
          specialty: true,
        },
        orderBy: [{ firstNameEn: 'asc' }, { lastNameEn: 'asc' }],
      });
    }

    return NextResponse.json({
      locale,
      data: doctors.map((doctor) => ({
        id: doctor.id,
        firstName: getLocalizedField(doctor, 'firstName', locale),
        lastName: getLocalizedField(doctor, 'lastName', locale),
        name: getDoctorDisplayName(doctor, locale),
        title: getLocalizedField(doctor.specialty, 'name', locale),
        bio: getLocalizedField(doctor, 'bio', locale),
        experienceYears: doctor.experienceYears,
        photoUrl: doctor.photoUrl,
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
