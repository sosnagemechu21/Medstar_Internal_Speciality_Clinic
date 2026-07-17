import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { UserEntity, PatientProfileInput } from '../entities/User';
import bcrypt from 'bcryptjs';

export class RegisterUser {
  constructor(private userRepo: UserRepository) {}

  async execute(
    userInput: { email: string; password: string; phoneNumber?: string },
    profileInput: PatientProfileInput
  ) {
    const existingUser = await this.userRepo.findByEmail(userInput.email);
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(userInput.password, 10);
    const phoneNumber = userInput.phoneNumber ?? `+999${Date.now()}${Math.floor(Math.random() * 1000)}`;

    return await this.userRepo.registerPatient(
      {
        phoneNumber,
        email: userInput.email,
        passwordHash,
        role: 'patient',
      },
      profileInput
    );
  }
}