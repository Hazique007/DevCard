// features/automations/hooks/use-automations.ts
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useConnections = () => {
  const trpc = useTRPC();
  return useQuery(trpc.automations.listConnections.queryOptions());
};

export const useCreateConnection = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.automations.createConnection.mutationOptions({
      onSuccess: () => {
          toast.success("Saved")
          queryClient.invalidateQueries({ queryKey: trpc.automations.listConnections.queryKey() });
      },

       onError: (error) => toast.error(`Failed to save: ${error.message}`),
       
    }),
  );
};

export const useRunAutomation = () => {
  const trpc = useTRPC();
  return useMutation(trpc.automations.run.mutationOptions());
};

export const useAutomationRun = (runId: string | null) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.automations.getRun.queryOptions({ runId: runId! }),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "DONE" || status === "FAILED" ? false : 1500;
    },
  });
};