import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(private userRepo: UserRepository) {}

  async execute(emailOrName: string, password: string) {
    const user =
      (await this.userRepo.findByIdentifier(emailOrName)) ||
      (await this.userRepo.findByEmail(emailOrName));

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    let passwordMatch = await bcrypt.compare(password, user.passwordHash);

    // Fallback check for doctor name password format (<firstname><lastname>@1234)
    if (!passwordMatch && user.doctor) {
      const docFirstName = user.doctor.firstNameEn.toLowerCase().replace(/[^a-z]/g, '');
      const docLastName = user.doctor.lastNameEn.toLowerCase().replace(/[^a-z]/g, '');
      const namePassword = `${docFirstName}${docLastName}@1234`;
      if (password.trim().toLowerCase() === namePassword) {
        passwordMatch = true;
      }
    }

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
        : (user.email || emailOrName).split('@')[0];

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