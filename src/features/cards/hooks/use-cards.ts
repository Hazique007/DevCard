"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseDueCards = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.cards.getDueCards.queryOptions({ limit: 20 }, { staleTime: 0 }),
  );
};

export const useCardsList = (params: { search: string; category: string }) => {
  const trpc = useTRPC();
  return useInfiniteQuery(
    trpc.cards.getMany.infiniteQueryOptions(
      { ...params, limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );
};

export const useCreateCard = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.cards.create.mutationOptions({
      onSuccess: () => {
        toast.success("Card added");
        queryClient.invalidateQueries(trpc.cards.getMany.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getStats.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getDueCards.pathFilter());
      },
      onError: (error) => toast.error(`Failed to create card: ${error.message}`),
    }),
  );
};

export const useReviewCard = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.cards.review.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cards.getDueCards.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getStats.pathFilter());
      },
      onError: (error) => toast.error(`Failed to save review: ${error.message}`),
    }),
  );
};

export const useCardStats = () => {
  const trpc = useTRPC();
  return useQuery(trpc.cards.getStats.queryOptions(undefined, { staleTime: 30_000 }));
};

export const useDeleteCard = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.cards.remove.mutationOptions({
      onMutate: async ({ id }) => {
        const filter = trpc.cards.getMany.pathFilter();

        await queryClient.cancelQueries(filter);

        const previous = queryClient.getQueriesData(filter);

        queryClient.setQueriesData(filter, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              cards: page.cards.filter((c: any) => c.id !== id),
            })),
          };
        });

        return { previous };
      },
      onError: (error, _vars, context) => {
        context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(`Failed to delete card: ${error.message}`);
      },
      onSuccess: () => {
        toast.success("Card deleted");
      },
      onSettled: () => {
        queryClient.invalidateQueries(trpc.cards.getMany.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getStats.pathFilter());
      },
    }),
  );
};