import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { RegisterUser } from '@/core/use-cases/RegisterUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phoneNumber, firstNameEn, lastNameEn, firstNameAm, lastNameAm, gender, dateOfBirth } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let resolvedFirstName = firstNameEn;
    let resolvedLastName = lastNameEn;

    if (fullName && !firstNameEn) {
      const parts = fullName.trim().split(/\s+/);
      resolvedFirstName = parts[0] ?? fullName;
      resolvedLastName = parts.slice(1).join(' ') || parts[0] || fullName;
    }

    if (!resolvedFirstName || !resolvedLastName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const userRepo = new UserRepository();
    const registerUserUseCase = new RegisterUser(userRepo);

    const result = await registerUserUseCase.execute(
      { email, password, phoneNumber },
      {
        firstNameEn: resolvedFirstName,
        lastNameEn: resolvedLastName,
        firstNameAm: firstNameAm ?? resolvedFirstName,
        lastNameAm: lastNameAm ?? resolvedLastName,
        gender: gender ?? 'unspecified',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
      }
    );

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_REGISTERED') {
      return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Registration Server Error' }, { status: 500 });
  }
}