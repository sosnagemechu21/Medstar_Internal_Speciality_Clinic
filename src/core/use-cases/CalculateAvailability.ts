import { TimeSlot } from '../entities/Schedule';
import { DoctorRepository } from '@/infrastructure/repositories/DoctorRepository';
import { parseAppointmentDate } from '@/lib/doctor-session';

export class CalculateAvailability {
  constructor(private doctorRepo: DoctorRepository) {}

  async execute(doctorId: string, dateParam: string): Promise<TimeSlot[]> {
    const [year, month, day] = dateParam.split('-').map(Number);
    if (!year || !month || !day) return [];

    const dayStart = parseAppointmentDate(dateParam);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const dayOfWeek = dayStart.getUTCDay();

    const [releasedSlots, unavailableSlotList, bookedTimesList, template] = await Promise.all([
      this.doctorRepo.getReleasedTimeSlots(doctorId, dayStart, dayEnd),
      this.doctorRepo.getUnavailableTimeSlots(doctorId, dayStart, dayEnd),
      this.doctorRepo.getActiveBookedTimes(doctorId, dayStart, dayEnd),
      this.doctorRepo.getScheduleTemplate(doctorId, dayOfWeek),
    ]);

    const unavailableTimes = new Set([...unavailableSlotList, ...bookedTimesList]);
    const availableMap = new Map<string, TimeSlot>();

    // 1. Include explicit released slots created by doctor in portal
    for (const slot of releasedSlots) {
      if (!unavailableTimes.has(slot.startTime)) {
        availableMap.set(slot.startTime, {
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }

    // 2. Include template-generated slots if template exists
    if (template) {
      let currentMins = this.timeToMinutes(template.startTime);
      const endMins = this.timeToMinutes(template.endTime);

      while (currentMins + template.slotDurationMinutes <= endMins) {
        const timeString = this.minutesToTime(currentMins);
        const endTimeString = this.minutesToTime(currentMins + template.slotDurationMinutes);

        if (!unavailableTimes.has(timeString) && !availableMap.has(timeString)) {
          availableMap.set(timeString, {
            startTime: timeString,
            endTime: endTimeString,
          });
        }

        currentMins += template.slotDurationMinutes;
      }
    }

    // 3. Filter past slots if dateParam is today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = dateParam === todayStr;

    let result = Array.from(availableMap.values());

    if (isToday) {
      result = result.filter((slot) => {
        const [hours, mins] = slot.startTime.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, mins, 0, 0);
        return slotTime > now;
      });
    }

    // Sort by startTime
    result.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return result;
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