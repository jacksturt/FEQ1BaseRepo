import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const createEscrow = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
      vaultPublicKey: z.string(),
      mintA: z.string(),
      mintB: z.string(),
      amountInVault: z.string(),
      amountToReceive: z.string(),
      seed: z.string(),
      maker: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.escrow.create({
      data: {
        publicKey: input.publicKey,
        vaultPublicKey: input.vaultPublicKey,
        mintA: input.mintA,
        mintB: input.mintB,
        amountInVault: input.amountInVault,
        amountToReceive: input.amountToReceive,
        seed: input.seed,
        maker: input.publicKey,
      },
    });
  });
