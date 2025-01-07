import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const readCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    return ctx.db.counter.findFirst({
      where: {
        publicKey: input.publicKey,
      },
    });
  });
