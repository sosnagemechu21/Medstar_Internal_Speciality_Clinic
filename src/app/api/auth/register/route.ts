import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { RegisterUser } from '@/core/use-cases/RegisterUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, password, firstNameEn, lastNameEn, firstNameAm, lastNameAm, gender, dateOfBirth } = body;

    if (!phoneNumber || !password || !firstNameEn || !lastNameEn || !firstNameAm || !lastNameAm || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'Missing mandatory account profile attributes' }, { status: 400 });
    }

    const userRepo = new UserRepository();
    const registerUserUseCase = new RegisterUser(userRepo);

    const result = await registerUserUseCase.execute(
      { phoneNumber, email, password },
      { firstNameEn, lastNameEn, firstNameAm, lastNameAm, gender, dateOfBirth: new Date(dateOfBirth) }
    );

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'PHONE_ALREADY_REGISTERED') {
      return NextResponse.json({ error: 'This phone number is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Registration Server Error' }, { status: 500 });
  }
}