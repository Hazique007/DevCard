"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useNotesList = (search: string) => {
  const trpc = useTRPC();
  return useInfiniteQuery(
    trpc.notes.getMany.infiniteQueryOptions(
      { search, limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
    ),
  );
};

export const useCreateNote = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.create.mutationOptions({
      onSuccess: () => {
        toast.success("Note saved");
        queryClient.invalidateQueries(trpc.notes.getMany.pathFilter());
      },
      onError: (error) => toast.error(`Failed to save note: ${error.message}`),
    }),
  );
};

export const useDeleteNotes = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notes.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Note deleted");
        queryClient.invalidateQueries(trpc.notes.getMany.pathFilter());
      },
      onError: (error) => toast.error(`Failed to delete note: ${error.message}`),
    }),
  );
};