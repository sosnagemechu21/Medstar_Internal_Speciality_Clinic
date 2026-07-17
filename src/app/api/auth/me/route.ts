import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('medstar_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    const decoded = jwt.verify(sessionCookie, jwtSecret) as { userId: string };

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { patient: true, doctor: true },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    const displayName = dbUser.patient
      ? dbUser.patient.firstNameEn
      : dbUser.doctor
        ? dbUser.doctor.firstNameEn
        : dbUser.email?.split('@')[0] ?? 'User';

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        displayName,
        fullName: dbUser.patient
          ? `${dbUser.patient.firstNameEn} ${dbUser.patient.lastNameEn}`
          : null,
        patientId: dbUser.patient?.id ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
