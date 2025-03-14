import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type the input for the deleteEscrow mutation using zod.
export const deleteEscrow = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Use the globally available db instance from context to update the escrow
    return ctx.db.escrow.delete({
      where: {
        publicKey: input.publicKey,
      },
    });
  });
