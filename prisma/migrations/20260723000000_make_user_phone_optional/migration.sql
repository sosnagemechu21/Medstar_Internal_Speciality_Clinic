-- Align User.phoneNumber with schema: optional profile field (nullable unique)
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP NOT NULL;
