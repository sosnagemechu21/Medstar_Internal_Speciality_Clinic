import { prisma } from '@/lib/prisma';
import { UserEntity, PatientProfileInput } from '@/core/entities/User';

export class UserRepository {
  async findByPhoneNumber(phoneNumber: string) {
    return await prisma.user.findUnique({
      where: { phoneNumber },
      include: { patient: true, doctor: true },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true },
    });
  }

  async registerPatient(user: UserEntity, profile: PatientProfileInput) {
    // Perform an atomic registration transaction using Prisma
    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber: user.phoneNumber,
          email: user.email,
          passwordHash: user.passwordHash,
          role: 'patient',
        },
      });

      const newPatient = await tx.patient.create({
        data: {
          userId: newUser.id,
          firstNameEn: profile.firstNameEn,
          lastNameEn: profile.lastNameEn,
          firstNameAm: profile.firstNameAm,
          lastNameAm: profile.lastNameAm,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
        },
      });

      return { user: newUser, patient: newPatient };
    });
  }
}