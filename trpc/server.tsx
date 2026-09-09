import "server-only";
import { createTRPCContext } from "./init";
import { appRouter } from "./routers/_app";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const getQueryClient = cache(() => new QueryClient());

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}