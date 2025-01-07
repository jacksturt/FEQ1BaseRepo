import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const incrementCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.update({
      where: {
        publicKey: input.publicKey,
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });
  });

export const decrementCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.update({
      where: {
        publicKey: input.publicKey,
      },
      data: {
        count: {
          decrement: 1,
        },
      },
    });
  });

export const setCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
      count: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.update({
      where: {
        publicKey: input.publicKey,
      },
      data: {
        count: input.count,
      },
    });
  });

export const resetCounter = publicProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.counter.update({
      where: {
        publicKey: input.publicKey,
      },
      data: {
        count: 0,
      },
    });
  });
