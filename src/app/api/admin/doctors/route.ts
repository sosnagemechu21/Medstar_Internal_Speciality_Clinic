import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      firstNameEn, 
      lastNameEn, 
      firstNameAm, 
      lastNameAm, 
      specialtyId, 
      bioEn, 
      bioAm, 
      experienceYears,
      photoUrl 
    } = body;

    // Validate required fields
    if (!email || !password || !specialtyId || !firstNameEn || !lastNameEn) {
      return NextResponse.json({ error: 'Missing required doctor fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Run transaction to create User and Doctor profile together
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'doctor', // assigned doctor role
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialtyId,
          firstNameEn,
          lastNameEn,
          firstNameAm: firstNameAm || firstNameEn,
          lastNameAm: lastNameAm || lastNameEn,
          bioEn: bioEn || '',
          bioAm: bioAm || '',
          isActive: true,
        },
      });

      return { user, doctor };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}