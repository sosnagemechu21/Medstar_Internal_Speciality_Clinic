import { NextRequest, NextResponse } from 'next/server';
import { getLocale } from 'next-intl/server';

import { getLocalizedField, resolveLocale } from '@/lib/i18n-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const locale = resolveLocale(
      request.nextUrl.searchParams.get('locale'),
      await getLocale().catch(() => undefined)
    );

    const departments = await prisma.specialty.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { nameEn: 'asc' },
    });

    return NextResponse.json({
      locale,
      data: departments.map((department) => ({
        id: department.id,
        name: getLocalizedField(department, 'name', locale),
        title: getLocalizedField(department, 'name', locale),
        description: getLocalizedField(department, 'description', locale),
        doctorCount: department._count.doctors,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}