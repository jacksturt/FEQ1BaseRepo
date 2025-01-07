import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const createCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.create({
      data: {
        publicKey: input.publicKey,
      },
    });
  });
