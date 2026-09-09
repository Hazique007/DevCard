import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const useSetGroqApiKey = (
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setKey: React.Dispatch<React.SetStateAction<string>>,
) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.setGroqKey.mutationOptions({
      onSuccess: () => {
        toast.success("API key saved");
        setOpen(false);
        setKey("");
      },
      onError: (error) => toast.error(error.message),
    }),
  );
};

export const useGetMe = () => {
  const trpc = useTRPC();

  return useQuery(trpc.users.getMe.queryOptions());
};
