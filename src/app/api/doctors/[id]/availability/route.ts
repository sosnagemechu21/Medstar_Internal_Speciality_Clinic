import { NextRequest, NextResponse } from 'next/server';
import { DoctorRepository } from '@/infrastructure/repositories/DoctorRepository';
import { CalculateAvailability } from '@/core/use-cases/CalculateAvailability';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const doctorRepository = new DoctorRepository();
    const calculateAvailabilityUseCase = new CalculateAvailability(doctorRepository);

    const availableSlots = await calculateAvailabilityUseCase.execute(doctorId, dateParam);

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Availability Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}