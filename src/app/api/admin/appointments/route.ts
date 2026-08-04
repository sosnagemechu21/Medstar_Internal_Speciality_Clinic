import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSessionDoctor } from '@/lib/doctor-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok || session.ctx.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const doctorId = request.nextUrl.searchParams.get('doctorId') ?? undefined;
    const status = request.nextUrl.searchParams.get('status') ?? undefined;

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(doctorId ? { doctorId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        doctor: {
          include: {
            specialty: true,
          },
        },
        patient: {
          include: {
            user: {
              select: { email: true, phoneNumber: true },
            },
          },
        },
        payment: true,
      },
      orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error('Admin appointments GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
