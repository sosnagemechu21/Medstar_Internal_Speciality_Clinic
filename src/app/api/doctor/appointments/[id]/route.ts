import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSessionDoctor } from '@/lib/doctor-session';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await resolveSessionDoctor(request);
    if (!session.ok) {
      return NextResponse.json({ success: false, error: session.error }, { status: session.status });
    }

    const { doctorId, role } = session.ctx;
    const { id: appointmentId } = await context.params;
    const { status } = await request.json();

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, doctorId: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    // Doctors may only update their own queue; admins can update any appointment.
    if (role !== 'admin') {
      if (!doctorId) {
        return NextResponse.json(
          {
            success: false,
            error: 'No doctor profile is linked to this account',
          },
          { status: 400 }
        );
      }
      if (existing.doctorId !== doctorId) {
        return NextResponse.json(
          { success: false, error: 'You can only manage appointments for your own doctor profile' },
          { status: 403 }
        );
      }
    }

    const updatedAppointment = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status },
      });

      if (status === 'cancelled') {
        await tx.timeSlot.updateMany({
          where: {
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate,
            startTime: appointment.startTime,
          },
          data: { status: 'released' },
        });
      }

      if (status === 'confirmed') {
        await tx.timeSlot.updateMany({
          where: {
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate,
            startTime: appointment.startTime,
          },
          data: { status: 'booked' },
        });
      }

      return appointment;
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error: any) {
    console.error('Doctor appointment PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
