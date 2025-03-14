import { publicProcedure } from "@/server/api/trpc";
import { EscrowStatus } from "@prisma/client";
import { z } from "zod";

// Type the input for the addTaker mutation using zod. Essentiall add this person as the taker for this escrow
export const addTaker = publicProcedure
  .input(
    z.object({
      // TODO: Implement this
    })
  )
  .mutation(async ({ ctx, input }) => {
    // TODO: Implement this
  });
