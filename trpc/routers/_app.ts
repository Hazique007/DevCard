import { notesRouter } from "@/src/features/notes/server/router";
import { createTRPCRouter } from "../init";
import { cardsRouter } from "@/src/features/cards/server/router";
import { userRouter } from "@/src/features/users/server/router";
import { assistantRouter } from "@/src/features/assistant/server/router";
import { automationsRouter } from "@/src/features/automations/server/router";

export const appRouter = createTRPCRouter({
  cards: cardsRouter,
  notes:notesRouter,
  users:userRouter,
  assistant:assistantRouter,
  automations:automationsRouter
});

export type AppRouter = typeof appRouter;