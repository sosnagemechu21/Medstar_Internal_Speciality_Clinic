import { AppointmentRepository } from '@/infrastructure/repositories/AppointmentRepository';
import { AppointmentEntity } from '../entities/Appointment';

export class UpdateAppointment {
  constructor(private appointmentRepo: AppointmentRepository) {}

  async execute(id: string, updates: Partial<AppointmentEntity>) {
    const validStatuses = ['pending', 'confirmed', 'rescheduled', 'cancelled', 'completed'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      throw new Error('INVALID_STATUS');
    }

    return await this.appointmentRepo.update(id, updates);
  }
}