-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('CREATED', 'TAKEN', 'REFUNDED');

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "maker" TEXT NOT NULL DEFAULT 'BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs',
ADD COLUMN     "status" "EscrowStatus" NOT NULL DEFAULT 'CREATED',
ADD COLUMN     "taker" TEXT;
