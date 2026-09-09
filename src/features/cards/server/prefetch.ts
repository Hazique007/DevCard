import { getQueryClient, trpc } from "@/trpc/server";

export async function prefetchDueCards() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.cards.getDueCards.queryOptions({ limit: 20 }));
}

export async function prefetchCardStats() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.cards.getStats.queryOptions());
}