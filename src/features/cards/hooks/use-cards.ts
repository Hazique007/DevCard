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


export const useCreateCard =()=>{
    const trpc = useTRPC()
 const queryClient = useQueryClient();

 return useMutation(
    trpc.cards.create.mutationOptions({
        onSuccess: () => {
        toast.success("Card added");
        queryClient.invalidateQueries({ queryKey: trpc.cards.getMany.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.cards.getStats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.cards.getDueCards.queryKey() });
      },
        onError: (error) => toast.error(`Failed to create card: ${error.message}`),
    })
 )
    
}


export const useReviewCard=()=>{
      const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.cards.review.mutationOptions({
         onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.cards.getDueCards.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.cards.getStats.queryKey() });
      },
      onError: (error) => toast.error(`Failed to save review: ${error.message}`),
    })
  )
}


export const useCardStats = ()=>{
const trpc = useTRPC()
return useQuery (
    trpc.cards.getStats.queryOptions(undefined,{staleTime:30_000})
)
}


export const useDeleteCard = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.cards.remove.mutationOptions({
      onMutate: async ({ id }) => {
        // Stop any in-flight refetch so it doesn't clobber our optimistic edit
        await queryClient.cancelQueries({ queryKey: trpc.cards.getMany.queryKey() });

        const previous = queryClient.getQueriesData({ queryKey: trpc.cards.getMany.queryKey() });

        // Remove the card from every cached getMany page immediately
        queryClient.setQueriesData(
          { queryKey: trpc.cards.getMany.queryKey() },
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                cards: page.cards.filter((c: any) => c.id !== id),
              })),
            };
          },
        );

        return { previous }; // saved for rollback on error
      },
      onError: (error, _vars, context) => {
        // Roll back if the server actually rejected it
        context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
        toast.error(`Failed to delete card: ${error.message}`);
      },
      onSuccess: () => {
        toast.success("Card deleted");
      },
      onSettled: () => {
        // Reconcile with the real server state regardless of outcome
        queryClient.invalidateQueries({ queryKey: trpc.cards.getMany.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.cards.getStats.queryKey() });
      },
    }),
  );
};