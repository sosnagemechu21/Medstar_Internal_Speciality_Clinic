import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/repositories/AppointmentRepository';
import { CreateAppointment } from '@/core/use-cases/CreateAppointment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, doctorId, appointmentDate, startTime, endTime } = body;

    if (!patientId || !doctorId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required request payload attributes' }, { status: 400 });
    }

    const appointmentRepository = new AppointmentRepository();
    const createAppointmentUseCase = new CreateAppointment(appointmentRepository);

    const appointment = await createAppointmentUseCase.execute({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json({ error: 'This time slot is already taken.' }, { status: 409 });
    }
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}