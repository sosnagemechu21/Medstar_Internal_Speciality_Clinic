import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

// 1. Clear existing data to avoid duplicates if re-run.
  //    Wrapped in try/catch so tables that don't exist yet (before migrations)
  //    don't abort the seed.
  const clearTable = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e: any) {
      // P2021 = table does not exist; ignore so seeding can proceed
      if (e?.code !== 'P2021') {
        console.warn(`Warning clearing table: ${e?.message ?? e}`);
      }
    }
  };

  await clearTable(() => prisma.payment.deleteMany({}));
  await clearTable(() => prisma.appointment.deleteMany({}));
  await clearTable(() => prisma.timeSlot.deleteMany({}));
  await clearTable(() => prisma.doctorSchedule.deleteMany({}));
  await clearTable(() => prisma.doctor.deleteMany({}));
  await clearTable(() => prisma.specialty.deleteMany({}));
  await clearTable(() => prisma.patient.deleteMany({}));
  await clearTable(() => prisma.user.deleteMany({}));

  // 2. Create Core Specialties (English and Amharic)
  const cardiology = await prisma.specialty.create({
    data: {
      nameEn: 'Cardiology',
      nameAm: 'የልብ ሕክምና (Cardiology)',
      descriptionEn: 'Heart and cardiovascular system care.',
      descriptionAm: 'የልብ እና የደም ዝውውር ሥርዓት ሕክምና።',
    },
  });

  const pediatrics = await prisma.specialty.create({
    data: {
      nameEn: 'Pediatrics',
      nameAm: 'የህጻናት ሕክምና (Pediatrics)',
      descriptionEn: 'Medical care for infants, children, and adolescents.',
      descriptionAm: 'ለሕፃናት፣ ለልጆች እና ለአቅመ አዳም ላልደረሱ ወጣቶች የሚሰጥ የሕክምና አገልግሎት።',
    },
  });

  const dermatology = await prisma.specialty.create({
    data: {
      nameEn: 'Dermatology',
      nameAm: 'የቆዳ ሕክምና (Dermatology)',
      descriptionEn: 'Skin, hair, and nail conditions.',
      descriptionAm: 'የቆዳ፣ የፀጉር እና የጥፍር በሽታዎች ሕክምና።',
    },
  });

// 3. Create Admin account (login: admin@gmail.com / 12345678)
  const adminPasswordHash = await bcrypt.hash('12345678', 10);
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      phoneNumber: '+251911000000',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  // 4. Create Doctor account (login: doctor@gmail.com / 12345678)
  const doctorPasswordHash = await bcrypt.hash('12345678', 10);
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@gmail.com',
      phoneNumber: '+251911999999',
      passwordHash: doctorPasswordHash,
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      specialtyId: cardiology.id,
      firstNameEn: 'Doctors',
      lastNameEn: 'Demo',
      firstNameAm: 'ዶክተሮች',
      lastNameAm: 'ዲሞ',
      experienceYears: 10,
      bioEn: 'Specialist physician at Medstar Specialty Clinic.',
      bioAm: 'በሜድስታር ስፔሻሊቲ ክሊኒክ ልዩ የሕክምና ባለሙያ።',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });