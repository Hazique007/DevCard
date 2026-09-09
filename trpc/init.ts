import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson"

// ── Context ──────────────────────────────────────────────────────────────
// `cache()` from React ensures this only runs ONCE per request, even if
// multiple procedures need the context — avoids redundant auth lookups.
export const createTRPCContext = cache(async () => {
  // TODO: replace with real session lookup once auth is wired up.
  // For now, hardcode a single dev user so we can build/test the backend
  // without blocking on auth setup.
  return {
    userId: "dev-user-1",
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson, // ← add this
});

export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;

// ── protectedProcedure ───────────────────────────────────────────────────
// Every procedure that touches user data should use this, not baseProcedure.
// Centralizing the "is there a user?" check here means individual routers
// never have to remember to check auth themselves — it's structurally
// impossible to forget.
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});