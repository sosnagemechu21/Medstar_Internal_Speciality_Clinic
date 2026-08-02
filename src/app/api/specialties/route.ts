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

    const specialties = await prisma.specialty.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { nameEn: 'asc' },
    });

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