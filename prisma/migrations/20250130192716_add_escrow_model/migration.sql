-- CreateTable
CREATE TABLE "Escrow" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "vaultPublicKey" TEXT NOT NULL,
    "mintA" TEXT NOT NULL,
    "mintB" TEXT NOT NULL,
    "amountInVault" TEXT NOT NULL,
    "amountToReceive" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_publicKey_key" ON "Escrow"("publicKey");
