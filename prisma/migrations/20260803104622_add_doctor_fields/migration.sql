-- Add doctor profile fields used by the booking flow and admin panel
ALTER TABLE "Doctor" ADD COLUMN "experienceYears" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Doctor" ADD COLUMN "photoUrl" TEXT;

