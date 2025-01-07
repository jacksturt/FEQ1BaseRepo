import { createTRPCRouter } from "@/server/api/trpc";
import { createCounter } from "./create";
import { readCounter } from "./read";
import { deleteCounter } from "./delete";
import {
  decrementCounter,
  resetCounter,
  setCounter,
  incrementCounter,
} from "./update";

export const counterRouter = createTRPCRouter({
  create: createCounter,
  read: readCounter,
  increment: incrementCounter,
  decrement: decrementCounter,
  reset: resetCounter,
  set: setCounter,
  delete: deleteCounter,
});
