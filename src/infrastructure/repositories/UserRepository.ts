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

  async findByIdentifier(identifier: string) {
    const cleaned = identifier.trim();
    if (!cleaned) return null;

    // 1. Try direct email match
    const byEmail = await this.findByEmail(cleaned.toLowerCase());
    if (byEmail) return byEmail;

    // 2. Try phone number match
    const byPhone = await this.findByPhoneNumber(cleaned);
    if (byPhone) return byPhone;

    // 3. Try Doctor name match (e.g. "Dawit Amare", "dawit amare", "dawitamare", "Dr. Dawit Amare")
    const parts = cleaned
      .replace(/^dr\.?\s+/i, '')
      .split(/\s+/)
      .filter(Boolean);

    let doctors: Array<any> = [];
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      doctors = await prisma.doctor.findMany({
        where: {
          OR: [
            {
              firstNameEn: { equals: firstName, mode: 'insensitive' },
              lastNameEn: { equals: lastName, mode: 'insensitive' },
            },
            {
              firstNameAm: { equals: firstName, mode: 'insensitive' },
              lastNameAm: { equals: lastName, mode: 'insensitive' },
            },
          ],
        },
        include: { user: { include: { patient: true, doctor: true } } },
      });
    } else if (parts.length === 1) {
      const name = parts[0];
      doctors = await prisma.doctor.findMany({
        where: {
          OR: [
            { firstNameEn: { equals: name, mode: 'insensitive' } },
            { lastNameEn: { equals: name, mode: 'insensitive' } },
            { firstNameAm: { equals: name, mode: 'insensitive' } },
            { lastNameAm: { equals: name, mode: 'insensitive' } },
          ],
        },
        include: { user: { include: { patient: true, doctor: true } } },
      });
    }

    if (doctors.length > 0 && doctors[0].user) {
      return doctors[0].user;
    }

    return null;
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