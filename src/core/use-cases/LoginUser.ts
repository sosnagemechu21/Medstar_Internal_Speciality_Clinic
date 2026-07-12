import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(private userRepo: UserRepository) {}

  async execute(phoneNumber: string, password: string) {
    const user = await this.userRepo.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_this';
    
    // Package session claims securely
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

    return { token, user: { id: user.id, phoneNumber: user.phoneNumber, role: user.role } };
  }
}