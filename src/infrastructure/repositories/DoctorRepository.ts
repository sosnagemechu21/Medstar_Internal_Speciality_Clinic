import { prisma } from '@/lib/prisma';
import { DoctorScheduleTemplate, TimeSlot } from '@/core/entities/Schedule';

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

  async getReleasedTimeSlots(doctorId: string, start: Date, end: Date): Promise<TimeSlot[]> {
    const slots = await prisma.timeSlot.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: start, lte: end },
        status: 'released',
      },
      select: {
        startTime: true,
        endTime: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return slots;
  }

  async getUnavailableTimeSlots(doctorId: string, start: Date, end: Date): Promise<string[]> {
    const slots = await prisma.timeSlot.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: start, lte: end },
        status: { in: ['locked', 'booked'] },
      },
      select: { startTime: true },
    });

    return slots.map((s) => s.startTime);
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