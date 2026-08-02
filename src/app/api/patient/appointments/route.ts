import { NextRequest, NextResponse } from 'next/server';
import { GetPatientAppointments } from '@/core/use-cases/GetPatientAppointments';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('medstar_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized access token' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    const decoded = jwt.verify(sessionCookie, jwtSecret) as { patientId: string | null; role: string };

    // Enforce FR-PP-3: Server-side token matching check
    if (!decoded.patientId || decoded.role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden. Access restricted exclusively to patient accounts.' }, { status: 403 });
    }

    const getAppointmentsUseCase = new GetPatientAppointments();
    const dynamicTimelineData = await getAppointmentsUseCase.execute(decoded.patientId);

    return NextResponse.json(dynamicTimelineData);
  } catch (error) {
    console.error('Portal Endpoint Query Exception:', error);
    return NextResponse.json({ error: 'Session expired or invalid token verification context' }, { status: 401 });
  }
}