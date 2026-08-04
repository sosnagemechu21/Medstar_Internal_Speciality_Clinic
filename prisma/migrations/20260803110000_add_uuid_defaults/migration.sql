-- Add UUID defaults to all primary key id columns to match Prisma schema @default(uuid())
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Patient" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Specialty" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Doctor" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "DoctorSchedule" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Appointment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "TimeSlot" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Payment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

