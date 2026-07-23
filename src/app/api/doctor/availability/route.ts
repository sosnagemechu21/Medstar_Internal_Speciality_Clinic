import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const doctorId = dbUser.doctor?.id;
    const body = await request.json();
    const { appointmentDate, startTime, endTime } = body;

    if (!doctorId) {
      return NextResponse.json({ error: 'No doctor profile is linked to this account' }, { status: 400 });
    }

    if (!appointmentDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required availability fields' }, { status: 400 });
    }

    const newSlot = await prisma.timeSlot.create({
      data: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        status: 'released',
      },
    });

    return NextResponse.json({ success: true, slot: newSlot }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}