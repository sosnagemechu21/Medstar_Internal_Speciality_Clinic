import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data to avoid duplicates if re-run
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

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

  // 3. Create dummy User accounts and profiles for Doctors
  const doctorUser1 = await prisma.user.create({
    data: {
      phoneNumber: '+251911111111',
      passwordHash: '$2b$10$UnhashedPlaceholderChangeInProduction', // Use a real hash framework later
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUser1.id,
      specialtyId: cardiology.id,
      firstNameEn: 'Dr. Dawit',
      lastNameEn: 'Abebe',
      firstNameAm: 'ዶ/ር ዳዊት',
      lastNameAm: 'አበበ',
      bioEn: 'Senior Cardiologist with 10+ years of clinical practice.',
      bioAm: 'ከ10 ዓመት በላይ ክሊኒካዊ ልምድ ያላቸው ከፍተኛ የልብ ሐኪም።',
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      phoneNumber: '+251922222222',
      passwordHash: '$2b$10$UnhashedPlaceholderChangeInProduction',
      role: 'doctor',
    },
  });

  await prisma.doctor.create({
    data: {
      userId: doctorUser2.id,
      specialtyId: pediatrics.id,
      firstNameEn: 'Dr. Helen',
      lastNameEn: 'Tadesse',
      firstNameAm: 'ዶ/ር ሄለን',
      lastNameAm: 'ታደሰ',
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