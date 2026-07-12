import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { LoginUser } from '@/core/use-cases/LoginUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body;

    if (!phoneNumber || !password) {
      return NextResponse.json({ error: 'Missing credentials identification' }, { status: 400 });
    }

    const userRepo = new UserRepository();
    const loginUserUseCase = new LoginUser(userRepo);

    const { token, user } = await loginUserUseCase.execute(phoneNumber, password);
    const response = NextResponse.json({ success: true, user });

    // Inject token via an HTTP-Only secure cookie to avoid XSS vulnerabilities
    response.cookies.set('medstar_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 Week session life length
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'Invalid phone number or password credentials.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Authentication processing failure' }, { status: 500 });
  }
}