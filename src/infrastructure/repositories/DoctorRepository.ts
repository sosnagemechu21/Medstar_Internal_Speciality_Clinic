import { prisma } from '@/lib/prisma';
import { DoctorScheduleTemplate } from '@/core/entities/Schedule';

export class DoctorRepository {
  async getScheduleTemplate(doctorId: string, dayOfWeek: number): Promise<DoctorScheduleTemplate | null> {
    const raw = await prisma.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek },
    });

    if (!raw) return null;

    return {
      dayOfWeek: raw.dayOfWeek,
      startTime: raw.startTime,
      endTime: raw.endTime,
      slotDurationMinutes: raw.slotDurationMinutes,
    };
  }

  async getActiveBookedTimes(doctorId: string, start: Date, end: Date): Promise<string[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: start, lte: end },
        status: { in: ['pending', 'confirmed'] },
      },
      select: { startTime: true },
    });

    return appointments.map((a) => a.startTime);
  }
}