import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type the input for the createEscrow mutation using zod
export const createEscrow = publicProcedure
  .input(
    z.object({
      // TODO: Implement this
    })
  )
  .mutation(async ({ ctx, input }) => {
    // TODO: Implement this
  });
