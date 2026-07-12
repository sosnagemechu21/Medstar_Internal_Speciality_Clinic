export interface AppointmentEntity {
  id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "09:20"
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  cancellationReason?: string | null;
}