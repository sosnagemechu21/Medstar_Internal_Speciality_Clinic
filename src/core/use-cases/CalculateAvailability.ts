import { TimeSlot } from '../entities/Schedule';
import { DoctorRepository } from '@/infrastructure/repositories/DoctorRepository';

export class CalculateAvailability {
  constructor(private doctorRepo: DoctorRepository) {}

  // Replace the top lines of execute() with this:
 async execute(doctorId: string, dateParam: string): Promise<TimeSlot[]> {
    // Split '2026-07-13' safely into year, month, day components
    const [year, month, day] = dateParam.split('-').map(Number);
    // Create the date object using local time numbers (months are 0-indexed in JS)
    const targetDate = new Date(year, month - 1, day); 
    const dayOfWeek = targetDate.getDay(); 

    const template = await this.doctorRepo.getScheduleTemplate(doctorId, dayOfWeek);
    if (!template) return []; // <--- If no template matches this dayOfWeek, it returns []

    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
    const bookedTimesList = await this.doctorRepo.getActiveBookedTimes(doctorId, dayStart, dayEnd);
    const bookedTimes = new Set(bookedTimesList);

    const slots: TimeSlot[] = [];
    let currentMins = this.timeToMinutes(template.startTime);
    const endMins = this.timeToMinutes(template.endTime);

    const now = new Date();
    const isToday = new Date().toISOString().split('T')[0] === dateParam;

    while (currentMins + template.slotDurationMinutes <= endMins) {
      const timeString = this.minutesToTime(currentMins);
      const isAlreadyBooked = bookedTimes.has(timeString);
      
      let isPastTime = false;
      if (isToday) {
        const [hours, mins] = timeString.split(':').map(Number);
        const slotDateTime = new Date();
        slotDateTime.setHours(hours, mins, 0, 0);
        isPastTime = slotDateTime <= now;
      }

      if (!isAlreadyBooked && !isPastTime) {
        slots.push({
          startTime: timeString,
          endTime: this.minutesToTime(currentMins + template.slotDurationMinutes),
        });
      }

      currentMins += template.slotDurationMinutes;
    }

    return slots;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(mins: number): string {
    const hours = Math.floor(mins / 60).toString().padStart(2, '0');
    const minutes = (mins % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}