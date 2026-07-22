import { prisma } from '@/lib/prisma';
import { AppointmentEntity } from '@/core/entities/Appointment';

export class AppointmentRepository {
  async findConflictingAppointment(doctorId: string, date: Date, startTime: string): Promise<boolean> {
    const activeConflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: date,
        startTime,
        status: { in: ['pending', 'confirmed'] },
      },
    });
    return !!activeConflict;
  }

  async create(data: AppointmentEntity) {
    return await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
      },
      include: {
        doctor: true,
      },
    });
  }

  async update(id: string, data: Partial<AppointmentEntity>) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
        },
      });

      if (data.status === 'cancelled') {
        await tx.timeSlot.updateMany({
          where: { appointmentId: id },
          data: {
            status: 'released',
            appointmentId: null,
          },
        });
      } else if (data.status === 'confirmed') {
        await tx.timeSlot.updateMany({
          where: { appointmentId: id },
          data: {
            status: 'booked',
          },
        });
      }

      return updated;
    });
  }
}