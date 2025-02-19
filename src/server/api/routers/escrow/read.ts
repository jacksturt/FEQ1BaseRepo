import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type the input for the readEscrow query using zod (just the public key)
export const readEscrow = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    // Use the globally available db instance from context to find and escrow by public key
    return ctx.db.escrow.findFirst({
      where: {
        publicKey: input.publicKey,
      },
    });
  });
