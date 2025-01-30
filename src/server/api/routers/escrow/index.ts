import { createTRPCRouter } from "@/server/api/trpc";
import { createEscrow } from "./create";
import { readEscrow } from "./read";
import { addTaker } from "./update";

export const escrowRouter = createTRPCRouter({
  create: createEscrow,
  read: readEscrow,
  addTaker: addTaker,
});
