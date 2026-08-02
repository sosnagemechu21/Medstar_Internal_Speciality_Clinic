import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { parseAppointmentDate } from '@/lib/doctor-session';

export const dynamic = 'force-dynamic';

type BookingPayload = {
  doctorId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
};

function splitDisplayName(value: string | null | undefined) {
  const fallback = 'Patient';
  const parts = (value ?? fallback).trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? fallback;
  const lastName = parts.slice(1).join(' ') || firstName;

  return { firstName, lastName };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isSlotInsideSchedule(
  schedule: { startTime: string; endTime: string; slotDurationMinutes: number },
  startTime: string,
  endTime: string
) {
  const scheduleStart = timeToMinutes(schedule.startTime);
  const scheduleEnd = timeToMinutes(schedule.endTime);
  const slotStart = timeToMinutes(startTime);
  const slotEnd = timeToMinutes(endTime);

  return (
    slotStart >= scheduleStart &&
    slotEnd <= scheduleEnd &&
    slotEnd - slotStart === schedule.slotDurationMinutes &&
    (slotStart - scheduleStart) % schedule.slotDurationMinutes === 0
  );
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('medstar_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized access token' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    const decoded = jwt.verify(sessionCookie, jwtSecret) as { userId: string };

    const body = (await request.json()) as BookingPayload;
    const { doctorId, appointmentDate, startTime, endTime } = body;

    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required request payload attributes' }, { status: 400 });
    }

    let targetDate: Date;
    try {
      targetDate = parseAppointmentDate(appointmentDate);
    } catch {
      return NextResponse.json({ error: 'Invalid appointment date' }, { status: 400 });
    }

    const dayOfWeek = targetDate.getUTCDay();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        isActive: true,
        schedules: {
          where: { dayOfWeek },
          select: {
            startTime: true,
            endTime: true,
            slotDurationMinutes: true,
          },
          take: 1,
        },
      },
    });

    if (!doctor || !doctor.isActive) {
      return NextResponse.json({ error: 'Selected doctor is unavailable' }, { status: 404 });
    }

    const existingTimeSlot = await prisma.timeSlot.findUnique({
      where: {
        doctorId_appointmentDate_startTime: {
          doctorId,
          appointmentDate: targetDate,
          startTime,
        },
      },
    });

    const isExplicitlyReleased = existingTimeSlot?.status === 'released';
    const schedule = doctor.schedules[0];
    const isTemplateValid = schedule && isSlotInsideSchedule(schedule, startTime, endTime) && (!existingTimeSlot || existingTimeSlot.status === 'released');

    if (!isExplicitlyReleased && !isTemplateValid) {
      return NextResponse.json({ error: 'Selected time slot is invalid or unavailable' }, { status: 400 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findUnique({
        where: { id: decoded.userId },
        include: { patient: true },
      });

      if (!dbUser || dbUser.role !== 'patient') {
        throw new Error('UNAUTHORIZED_PATIENT');
      }

      let patient = dbUser.patient;
      if (!patient) {
        const emailPrefix = dbUser.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Patient';
        const { firstName, lastName } = splitDisplayName(emailPrefix);

        patient = await tx.patient.create({
          data: {
            userId: dbUser.id,
            firstNameEn: firstName,
            lastNameEn: lastName,
            firstNameAm: firstName,
            lastNameAm: lastName,
            gender: 'unspecified',
            dateOfBirth: new Date('1990-01-01'),
          },
        });
      }

      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          doctorId,
          appointmentDate: targetDate,
          startTime,
          status: { in: ['pending', 'confirmed'] },
        },
        select: { id: true },
      });

      if (conflictingAppointment) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          appointmentDate: targetDate,
          startTime,
          endTime,
          status: 'pending',
        },
        include: {
          doctor: {
            include: {
              specialty: true,
            },
          },
          patient: true,
        },
      });

      const existingTimeSlot = await tx.timeSlot.findUnique({
        where: {
          doctorId_appointmentDate_startTime: {
            doctorId,
            appointmentDate: targetDate,
            startTime,
          },
        },
      });

      if (existingTimeSlot && existingTimeSlot.status !== 'released') {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      const timeSlot = existingTimeSlot
        ? await tx.timeSlot.update({
            where: { id: existingTimeSlot.id },
            data: {
              endTime,
              status: 'locked',
              appointmentId: appointment.id,
            },
          })
        : await tx.timeSlot.create({
            data: {
              doctorId,
              appointmentDate: targetDate,
              startTime,
              endTime,
              status: 'locked',
              appointmentId: appointment.id,
            },
          });

      return { appointment, timeSlot, patientId: patient.id };
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_PATIENT') {
      return NextResponse.json({ error: 'Forbidden. Access restricted exclusively to patient accounts.' }, { status: 403 });
    }
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json({ error: 'This time slot is already taken.' }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'This time slot is already taken.' }, { status: 409 });
    }
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

