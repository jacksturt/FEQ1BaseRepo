import { publicProcedure } from "@/server/api/trpc";
import { EscrowStatus } from "@prisma/client";
import { z } from "zod";

// Type the input for the addTaker mutation using zod. Essentiall add this person as the taker for this escrow
export const addTaker = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
      taker: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Use the globally available db instance from context to update the escrow
    return ctx.db.escrow.update({
      where: {
        publicKey: input.publicKey,
      },
      data: {
        taker: input.taker,
        status: EscrowStatus.TAKEN,
      },
    });
  });
