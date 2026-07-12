import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { UserEntity, PatientProfileInput } from '../entities/User';
import bcrypt from 'bcryptjs';

export class RegisterUser {
  constructor(private userRepo: UserRepository) {}

  async execute(userInput: Omit<UserEntity, 'role' | 'passwordHash'> & { password: string }, profileInput: PatientProfileInput) {
    const existingUser = await this.userRepo.findByPhoneNumber(userInput.phoneNumber);
    if (existingUser) {
      throw new Error('PHONE_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(userInput.password, 10);

    return await this.userRepo.registerPatient(
      {
        phoneNumber: userInput.phoneNumber,
        email: userInput.email,
        passwordHash,
        role: 'patient',
      },
      profileInput
    );
  }
}