import { publicProcedure } from "@/server/api/trpc";
import { EscrowStatus } from "@prisma/client";
import { z } from "zod";

export const addTaker = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
      taker: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
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
