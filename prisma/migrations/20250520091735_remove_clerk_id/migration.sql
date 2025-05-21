/*
  Warnings:

  - You are about to drop the column `clerkId` on the `User` table. All the data in the column will be lost.

*/
-- Primeiro, removemos a restrição unique do campo clerkId
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_clerkId_key";

-- Depois, removemos a coluna clerkId
ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkId";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "locale" SET DEFAULT 'en';
