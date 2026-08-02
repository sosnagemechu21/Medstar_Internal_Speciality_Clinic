import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSessionDoctor } from '@/lib/doctor-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok) {
      return NextResponse.json({ success: false, error: session.error }, { status: session.status });
    }

    const { doctorId, userId, role } = session.ctx;

    if (!doctorId) {
      return NextResponse.json({
        success: true,
        doctorId: null,
        userId,
        role,
        appointments: [],
        schedules: [],
        message:
          'No doctor profile is linked to this user account. Link User → Doctor.userId before managing slots.',
      });
    }

    const [appointments, schedules] = await Promise.all([
      prisma.appointment.findMany({
        where: { doctorId },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { appointmentDate: 'desc' },
      }),
      prisma.timeSlot.findMany({
        where: { doctorId },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      doctorId,
      userId,
      role,
      appointments,
      schedules,
    });
  } catch (error: any) {
    console.error('Doctor dashboard-data error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
