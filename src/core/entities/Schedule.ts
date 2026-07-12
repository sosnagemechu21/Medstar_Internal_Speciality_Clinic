export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DoctorScheduleTemplate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}