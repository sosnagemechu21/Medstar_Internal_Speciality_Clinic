import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      phoneNumber,
      firstNameEn,
      lastNameEn,
      firstNameAm,
      lastNameAm,
      specialtyName,
      experienceYears,
      bioEn,
      bioAm,
      photoDataUrl,
    } = body;

    const normalizedSpecialtyName = typeof specialtyName === 'string' ? specialtyName.trim() : '';
    const normalizedPhone =
      typeof phoneNumber === 'string' && phoneNumber.trim()
        ? phoneNumber.trim()
        : `+999${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const defaultDocPassword = `${firstNameEn.toLowerCase().replace(/[^a-z0-9]/g, '')}${lastNameEn.toLowerCase().replace(/[^a-z0-9]/g, '')}@1234`;
    const effectivePassword = (typeof password === 'string' && password.trim()) ? password.trim() : defaultDocPassword;

    // Validate required fields
    if (!email || !normalizedSpecialtyName || !firstNameEn || !lastNameEn) {
      return NextResponse.json({ success: false, error: 'Missing required doctor fields' }, { status: 400 });
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    if (phoneNumber && phoneNumber.trim()) {
      const existingPhone = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhone } });
      if (existingPhone) {
        return NextResponse.json({ success: false, error: 'User with this phone number already exists' }, { status: 400 });
      }
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(effectivePassword, 10);

    // Run transaction to create User and Doctor profile together
    const result = await prisma.$transaction(async (tx) => {
      let specialty = await tx.specialty.findFirst({
        where: {
          nameEn: {
            equals: normalizedSpecialtyName,
            mode: 'insensitive',
          },
        },
      });

      if (!specialty) {
        specialty = await tx.specialty.create({
          data: {
            nameEn: normalizedSpecialtyName,
            nameAm: normalizedSpecialtyName,
          },
        });
      }

      const user = await tx.user.create({
        data: {
          email,
          phoneNumber: normalizedPhone,
          passwordHash,
          role: 'doctor',
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialtyId: specialty.id,
          firstNameEn,
          lastNameEn,
          firstNameAm: firstNameAm || firstNameEn,
          lastNameAm: lastNameAm || lastNameEn,
          experienceYears: Number(experienceYears) || 1,
          photoUrl: photoDataUrl || null,
          bioEn: bioEn || '',
          bioAm: bioAm || '',
          isActive: true,
        },
      });

      return { user, doctor };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('Doctor creation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        specialty: true,
        user: { select: { email: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, doctors });
  } catch (error: any) {
    console.error('Admin doctors GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}