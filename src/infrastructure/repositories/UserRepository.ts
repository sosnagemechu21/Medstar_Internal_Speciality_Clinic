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
    const cleanedName = cleaned.replace(/^dr\.?\s+/i, '').trim();
    const parts = cleanedName.split(/\s+/).filter(Boolean);

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

    if (doctors.length > 0) {
      const doc = doctors[0];
      if (doc.user) {
        return doc.user;
      }

      // If doctor profile exists without a user account, auto-provision user account
      const docFirstName = doc.firstNameEn.toLowerCase().replace(/[^a-z0-9]/g, '');
      const docLastName = doc.lastNameEn.toLowerCase().replace(/[^a-z0-9]/g, '');
      const docEmail = `${docFirstName}.${docLastName}@medstar.com`;
      const defaultPass = `${docFirstName}${docLastName}@1234`;
      const passwordHash = await import('bcryptjs').then((b) => b.hash(defaultPass, 10));

      const newUser = await prisma.user.create({
        data: {
          email: docEmail,
          passwordHash,
          role: 'doctor',
        },
      });

      await prisma.doctor.update({
        where: { id: doc.id },
        data: { userId: newUser.id },
      });

      return await this.findByEmail(docEmail);
    }

    // 4. Auto-provision default Doctor if database wasn't seeded on production yet (e.g. "Dawit Amare")
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ');
      const normFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const defaultEmail = `${normFirst}${normLast}@medstar.com`;
      const defaultPass = `${normFirst}${normLast}@1234`;
      const passwordHash = await import('bcryptjs').then((b) => b.hash(defaultPass, 10));

      // Get or create default specialty
      let specialty = await prisma.specialty.findFirst({
        where: { nameEn: { equals: 'Cardiology', mode: 'insensitive' } },
      });
      if (!specialty) {
        specialty = await prisma.specialty.create({
          data: {
            nameEn: 'Cardiology',
            nameAm: 'የልብ ሕክምና (Cardiology)',
            descriptionEn: 'Heart and cardiovascular system care.',
            descriptionAm: 'የልብ እና የደም ዝውውር ሥርዓት ሕክምና።',
          },
        });
      }

      const newUser = await prisma.user.create({
        data: {
          email: defaultEmail,
          passwordHash,
          role: 'doctor',
        },
      });

      await prisma.doctor.create({
        data: {
          userId: newUser.id,
          specialtyId: specialty.id,
          firstNameEn: firstName,
          lastNameEn: lastName,
          firstNameAm: firstName,
          lastNameAm: lastName,
          experienceYears: 10,
          bioEn: `Specialist physician Dr. ${firstName} ${lastName}.`,
          bioAm: `የሕክምና ልዩ ባለሙያ ዶ/ር ${firstName} ${lastName}።`,
        },
      });

      return await this.findByEmail(defaultEmail);
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