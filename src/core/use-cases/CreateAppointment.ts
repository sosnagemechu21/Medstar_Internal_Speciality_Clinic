import { AppointmentRepository } from '@/infrastructure/repositories/AppointmentRepository';
import { AppointmentEntity } from '../entities/Appointment';

export class CreateAppointment {
  constructor(private appointmentRepo: AppointmentRepository) {}

  async execute(input: Omit<AppointmentEntity, 'status'>) {
    // Enforce FR-AE-2: Block slots already booked by other patients in real-time
    const hasConflict = await this.appointmentRepo.findConflictingAppointment(
      input.doctorId,
      input.appointmentDate,
      input.startTime
    );

    if (hasConflict) {
      throw new Error('SLOT_ALREADY_BOOKED');
    }

    return await this.appointmentRepo.create({
      ...input,
      status: 'pending', // Prototypes 2 & 4 default state
    });
  }
}