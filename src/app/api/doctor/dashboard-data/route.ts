import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('medstar_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized access token' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    const decoded = jwt.verify(sessionCookie, jwtSecret) as { userId: string };

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { doctor: true },
    });

    if (!dbUser || !['doctor', 'admin'].includes(dbUser.role.toLowerCase())) {
      return NextResponse.json({ error: 'Doctor portal access denied' }, { status: 403 });
    }

    const doctorId = dbUser.doctor?.id ?? null;

    if (!doctorId) {
      return NextResponse.json({ success: true, doctorId: null, appointments: [], schedules: [] });
    }

    // Fetch appointments assigned to this doctor with patient details
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });

    // Fetch availability slots set by this doctor
    const schedules = await prisma.timeSlot.findMany({
      where: { doctorId },
      orderBy: { appointmentDate: 'asc' }, // <-- Change 'date' to 'appointmentDate' (or 'slotDate') matching your schema
    });

    return NextResponse.json({
      success: true,
      doctorId,
      appointments,
      schedules,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}