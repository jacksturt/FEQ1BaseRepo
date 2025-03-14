import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

// Type the input for the readEscrow query using zod (just the public key)
export const readEscrow = publicProcedure
  .input(
    z.object({
      // TODO: Implement this
    })
  )
  .query(async ({ ctx, input }) => {
    // TODO: Implement this
  });
