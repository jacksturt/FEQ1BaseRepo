import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const deleteCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.delete({
      where: {
        publicKey: input.publicKey,
      },
    });
  });
