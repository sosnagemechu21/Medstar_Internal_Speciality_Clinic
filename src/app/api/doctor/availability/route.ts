import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseAppointmentDate, resolveSessionDoctor } from '@/lib/doctor-session';

export async function POST(request: NextRequest) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok) {
      return NextResponse.json({ success: false, error: session.error }, { status: session.status });
    }

    const { doctorId, userId, role } = session.ctx;
    const body = await request.json();
    const { appointmentDate, startTime, endTime } = body;

    // Never accept a client-supplied doctorId for non-admins (prevents User.id misuse).
    // Admins may optionally target another doctor profile by doctorId.
    let resolvedDoctorId = doctorId;
    if (role === 'admin' && typeof body.doctorId === 'string' && body.doctorId.trim()) {
      const target = await prisma.doctor.findUnique({
        where: { id: body.doctorId.trim() },
        select: { id: true },
      });
      if (!target) {
        return NextResponse.json(
          { success: false, error: 'Target doctor profile not found' },
          { status: 404 }
        );
      }
      resolvedDoctorId = target.id;
    }

    if (!resolvedDoctorId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No doctor profile is linked to this account. Time slots require a Doctor record id (not the User id). Ask an admin to re-create or link your doctor profile.',
          userId,
        },
        { status: 400 }
      );
    }

    if (!appointmentDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required availability fields' },
        { status: 400 }
      );
    }

    if (typeof startTime !== 'string' || typeof endTime !== 'string') {
      return NextResponse.json(
        { success: false, error: 'startTime and endTime must be strings (HH:MM)' },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    let slotDate: Date;
    try {
      slotDate = parseAppointmentDate(String(appointmentDate));
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid appointment date. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Confirm the Doctor row exists before insert (clearer than FK failure)
    const doctorExists = await prisma.doctor.findUnique({
      where: { id: resolvedDoctorId },
      select: { id: true },
    });
    if (!doctorExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Doctor profile not found for resolved doctorId',
          doctorId: resolvedDoctorId,
        },
        { status: 404 }
      );
    }

    const existing = await prisma.timeSlot.findUnique({
      where: {
        doctorId_appointmentDate_startTime: {
          doctorId: resolvedDoctorId,
          appointmentDate: slotDate,
          startTime,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'A slot already exists for this doctor at that date and start time',
          slot: existing,
        },
        { status: 409 }
      );
    }

    const newSlot = await prisma.timeSlot.create({
      data: {
        doctorId: resolvedDoctorId,
        appointmentDate: slotDate,
        startTime,
        endTime,
        status: 'released',
      },
    });

    return NextResponse.json(
      {
        success: true,
        doctorId: resolvedDoctorId,
        slot: newSlot,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Doctor availability POST error:', error);
    // Prisma unique violation
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This availability slot already exists' },
        { status: 409 }
      );
    }
    // Prisma FK violation (doctorId does not exist)
    if (error?.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid doctorId foreign key. The TimeSlot table expects Doctor.id, not User.id.',
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
