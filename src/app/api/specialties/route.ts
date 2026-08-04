import { NextRequest, NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

import { getLocalizedField, resolveLocale } from '@/lib/i18n-utils';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const locale = resolveLocale(
      request.nextUrl.searchParams.get('locale'),
      await getLocale().catch(() => undefined)
    );

    let specialties = await prisma.specialty.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { nameEn: 'asc' },
    });

    if (specialties.length === 0) {
      await prisma.specialty.createMany({
        data: [
          {
            nameEn: 'Cardiology',
            nameAm: 'የልብ ሕክምና (Cardiology)',
            descriptionEn: 'Heart and cardiovascular system care.',
            descriptionAm: 'የልብ እና የደም ዝውውር ሥርዓት ሕክምና።',
          },
          {
            nameEn: 'Pediatrics',
            nameAm: 'የህጻናት ሕክምና (Pediatrics)',
            descriptionEn: 'Medical care for infants, children, and adolescents.',
            descriptionAm: 'ለሕፃናት፣ ለልጆች እና ለአቅመ አዳም ላልደረሱ ወጣቶች የሚሰጥ የሕክምና አገልግሎት።',
          },
          {
            nameEn: 'Dermatology',
            nameAm: 'የቆዳ ሕክምና (Dermatology)',
            descriptionEn: 'Skin, hair, and nail conditions.',
            descriptionAm: 'የቆዳ፣ የፀጉር እና የጥፍር በሽታዎች ሕክምና።',
          },
          {
            nameEn: 'General Medicine',
            nameAm: 'ጠቅላላ ሕክምና (General Medicine)',
            descriptionEn: 'Comprehensive general medical consultations.',
            descriptionAm: 'አጠቃላይ የሕክምና ምርመራ እና ሕክምና።',
          },
        ],
        skipDuplicates: true,
      });

      specialties = await prisma.specialty.findMany({
        include: {
          _count: {
            select: { doctors: true },
          },
        },
        orderBy: { nameEn: 'asc' },
      });
    }

    return NextResponse.json({
      locale,
      data: specialties.map((specialty) => ({
        id: specialty.id,
        name: getLocalizedField(specialty, 'name', locale),
        description: getLocalizedField(specialty, 'description', locale),
        doctorCount: specialty._count.doctors,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}