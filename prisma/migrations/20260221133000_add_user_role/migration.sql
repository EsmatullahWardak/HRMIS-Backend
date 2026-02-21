-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OFFICER', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';

-- Promote most recently created user to ADMIN
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "id" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" DESC
  LIMIT 1
);
