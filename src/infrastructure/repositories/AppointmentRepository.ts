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
    return await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
      },
    });
  }
}