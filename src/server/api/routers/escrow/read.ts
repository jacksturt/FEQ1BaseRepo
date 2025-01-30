import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const readEscrow = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    return ctx.db.escrow.findFirst({
      where: {
        publicKey: input.publicKey,
      },
    });
  });
