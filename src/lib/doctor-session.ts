import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export type SessionDoctorContext = {
  userId: string;
  role: string;
  email: string | null;
  doctorId: string | null;
  doctor: {
    id: string;
    userId: string | null;
    firstNameEn: string;
    lastNameEn: string;
  } | null;
};

/**
 * Resolve the authenticated user and their Doctor profile id.
 * TimeSlot / Appointment tables require Doctor.id — never User.id.
 */
export async function resolveSessionDoctor(
  request: NextRequest
): Promise<
  | { ok: true; ctx: SessionDoctorContext }
  | { ok: false; status: number; error: string }
> {
  const sessionCookie = request.cookies.get('medstar_session')?.value;
  if (!sessionCookie) {
    return { ok: false, status: 401, error: 'Unauthorized access token' };
  }

  let decoded: { userId?: string; doctorId?: string | null };
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    decoded = jwt.verify(sessionCookie, jwtSecret) as {
      userId?: string;
      doctorId?: string | null;
    };
  } catch {
    return { ok: false, status: 401, error: 'Invalid or expired session' };
  }

  if (!decoded.userId) {
    return { ok: false, status: 401, error: 'Session missing user identity' };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      doctor: {
        select: {
          id: true,
          userId: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
    },
  });

  if (!dbUser) {
    return { ok: false, status: 401, error: 'User account not found' };
  }

  const role = dbUser.role.toLowerCase();
  if (!['doctor', 'admin'].includes(role)) {
    return { ok: false, status: 403, error: 'Doctor portal access denied' };
  }

  // Primary: Prisma relation via Doctor.userId → User.id
  let doctor = dbUser.doctor;

  // Fallback: explicit lookup by userId (covers relation edge cases)
  if (!doctor) {
    doctor = await prisma.doctor.findUnique({
      where: { userId: dbUser.id },
      select: {
        id: true,
        userId: true,
        firstNameEn: true,
        lastNameEn: true,
      },
    });
  }

  // Fallback: JWT doctorId claim, only if that profile belongs to this user
  if (!doctor && decoded.doctorId) {
    const fromToken = await prisma.doctor.findUnique({
      where: { id: decoded.doctorId },
      select: {
        id: true,
        userId: true,
        firstNameEn: true,
        lastNameEn: true,
      },
    });
    if (fromToken && fromToken.userId === dbUser.id) {
      doctor = fromToken;
    }
  }

  return {
    ok: true,
    ctx: {
      userId: dbUser.id,
      role,
      email: dbUser.email,
      doctorId: doctor?.id ?? null,
      doctor,
    },
  };
}

/** Parse HTML date input (YYYY-MM-DD) as a stable UTC calendar day. */
export function parseAppointmentDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) {
    const fallback = new Date(dateStr);
    if (Number.isNaN(fallback.getTime())) {
      throw new Error('INVALID_DATE');
    }
    return new Date(
      Date.UTC(fallback.getUTCFullYear(), fallback.getUTCMonth(), fallback.getUTCDate())
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}
