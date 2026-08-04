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

  // 3. Create Admin account (login: admin@medstar.com / Admin@2026!)
  const adminPasswordHash = await bcrypt.hash('Admin@2026!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@medstar.com',
      phoneNumber: '+251911000000',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  const dawitAmareHash = await bcrypt.hash('dawitamare@1234', 10);
  const doctorUserAmare = await prisma.user.create({
    data: {
      email: 'dawitamare@medstar.com',
      phoneNumber: '+251911999999',
      passwordHash: dawitAmareHash,
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUserAmare.id,
      specialtyId: cardiology.id,
      firstNameEn: 'Dawit',
      lastNameEn: 'Amare',
      firstNameAm: 'ዳዊት',
      lastNameAm: 'አማረ',
      experienceYears: 12,
      bioEn: 'Expert Cardiologist specializing in heart condition treatments.',
      bioAm: 'በልብ ህክምና ልዩ ባለሙያ ከ12 ዓመት በላይ ልምድ ያላቸው።',
    },
  });

  const dawitAbebeHash = await bcrypt.hash('dawitabebe@1234', 10);
  const doctorUser1 = await prisma.user.create({
    data: {
      email: 'doctor1@medstar.com',
      phoneNumber: '+251911111111',
      passwordHash: dawitAbebeHash,
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUser1.id,
      specialtyId: cardiology.id,
      firstNameEn: 'Dawit',
      lastNameEn: 'Abebe',
      firstNameAm: 'ዳዊት',
      lastNameAm: 'አበበ',
      experienceYears: 10,
      bioEn: 'Senior Cardiologist with 10+ years of clinical practice.',
      bioAm: 'ከ10 ዓመት በላይ ክሊኒካዊ ልምድ ያላቸው ከፍተኛ የልብ ሐኪም።',
    },
  });

  const helenTadesseHash = await bcrypt.hash('helentadesse@1234', 10);
  const doctorUser2 = await prisma.user.create({
    data: {
      email: 'doctor2@medstar.com',
      phoneNumber: '+251922222222',
      passwordHash: helenTadesseHash,
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUser2.id,
      specialtyId: pediatrics.id,
      firstNameEn: 'Helen',
      lastNameEn: 'Tadesse',
      firstNameAm: 'ሄለን',
      lastNameAm: 'ታደሰ',
      experienceYears: 8,
      bioEn: 'Compassionate pediatrician specializing in neonatal health.',
      bioAm: 'በአራስ ሕፃናት ጤና ላይ ያተኮሩ አፍቃሪ የሕፃናት ሐኪም።',
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