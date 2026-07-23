import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await context.params;
    const { status } = await request.json(); // expected 'confirmed' or 'cancelled'

    if (!['confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updatedAppointment = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status },
      });

      // If rejected/cancelled, free up the timeslot lock
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

      return appointment;
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}