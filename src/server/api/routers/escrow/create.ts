import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type the input for the createEscrow mutation using zod
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
    // Use the globally available db instance from context to create the escrow
    return ctx.db.escrow.create({
      data: { ...input },
    });
  });
