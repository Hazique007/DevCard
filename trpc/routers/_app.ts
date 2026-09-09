import { notesRouter } from "@/src/features/notes/server/router";
import { createTRPCRouter } from "../init";
import { cardsRouter } from "@/src/features/cards/server/router";

export const appRouter = createTRPCRouter({
  cards: cardsRouter,
  notes:notesRouter
});

export type AppRouter = typeof appRouter;