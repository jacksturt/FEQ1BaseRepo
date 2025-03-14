import { createTRPCRouter } from "@/server/api/trpc";
import { createEscrow } from "./create";
import { readEscrow } from "./read";
import { addTaker } from "./update";
import { deleteEscrow } from "./delete";

// Register individual routes to the escrow sub-router
export const escrowRouter = createTRPCRouter({
  create: createEscrow,
  read: readEscrow,
  addTaker: addTaker,
  delete: deleteEscrow,
});
