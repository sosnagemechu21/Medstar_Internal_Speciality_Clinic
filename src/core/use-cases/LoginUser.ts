import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(private userRepo: UserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        patientId: user.patient?.id || null,
        doctorId: user.doctor?.id || null 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const displayName = user.patient
      ? user.patient.firstNameEn
      : user.doctor
        ? user.doctor.firstNameEn
        : email.split('@')[0];

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName,
        patientId: user.patient?.id ?? null,
        doctorId: user.doctor?.id ?? null,
      },
    };
  }
}