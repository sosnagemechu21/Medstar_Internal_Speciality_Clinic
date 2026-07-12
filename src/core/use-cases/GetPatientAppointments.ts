import { prisma } from '@/lib/prisma';

export class GetPatientAppointments {
  async execute(patientId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: { appointmentDate: 'asc' },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize time comparison boundaries

    // Segment structural lists cleanly (SRS FR-PP-2)
    const upcoming = appointments.filter(app => new Date(app.appointmentDate) >= now);
    const history = appointments.filter(app => new Date(app.appointmentDate) < now);

    return { upcoming, history };
  }
}