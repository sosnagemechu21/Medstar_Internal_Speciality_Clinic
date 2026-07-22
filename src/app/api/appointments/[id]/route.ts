import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/repositories/AppointmentRepository';
import { UpdateAppointment } from '@/core/use-cases/UpdateAppointment';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    const body = await request.json();
    const { status, cancellationReason } = body;

    const appointmentRepository = new AppointmentRepository();
    const updateAppointmentUseCase = new UpdateAppointment(appointmentRepository);

    const updated = await updateAppointmentUseCase.execute(appointmentId, {
      status,
      cancellationReason,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === 'INVALID_STATUS') {
      return NextResponse.json({ error: 'Invalid operation status parameter context' }, { status: 400 });
    }
    console.error('Patch Operation Error:', error);
    return NextResponse.json({ error: 'Failed to modify database transaction record' }, { status: 500 });
  }
}