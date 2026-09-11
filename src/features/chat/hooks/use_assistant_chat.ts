"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const useAssistantChat = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastExchange, setLastExchange] = useState<{ question: string; answer: string } | null>(null);
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);

  const chat = useMutation(
    trpc.assistant.chat.mutationOptions({
      onError: (error) => toast.error(`Assistant error: ${error.message}`),
    }),
  );

  const createCardMutation = useMutation(
    trpc.assistant.createCardFromChat.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.cards.getMany.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getStats.pathFilter());
        queryClient.invalidateQueries(trpc.cards.getDueCards.pathFilter());
        toast.success("Card created");
      },
      onError: (error) => toast.error(`Couldn't create card: ${error.message}`),
    }),
  );

  // ── GitHub automation plumbing ────────────────────────────────────────
  const { data: connections } = useQuery(trpc.automations.listConnections.queryOptions());

  const runAutomation = useMutation(
    trpc.automations.run.mutationOptions({
      onError: (error) => {
        toast.error(`Couldn't reach GitHub automation: ${error.message}`);
        setPendingRunId(null);
      },
    }),
  );

  const { data: run } = useQuery({
    ...trpc.automations.getRun.queryOptions({ runId: pendingRunId! }),
    enabled: !!pendingRunId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "DONE" || status === "FAILED" ? false : 1500;
    },
  });

  useEffect(() => {
    if (!run) return;

    if (run.status === "DONE") {
      const answer = "```json\n" + JSON.stringify(run.resultPayload, null, 2) + "\n```";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setLastExchange((prev) => (prev ? { ...prev, answer } : null));
      setPendingRunId(null);
    }

    if (run.status === "FAILED") {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Automation failed: ${run.error ?? "unknown error"}` },
      ]);
      setPendingRunId(null);
    }
  }, [run?.status]);

  // ── Regular AI chat ──────────────────────────────────────────────────
  const sendMessage = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const history = messages.slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    try {
      const { answer } = await chat.mutateAsync({ question: trimmed, history });
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setLastExchange({ question: trimmed, answer });
    } catch {
      // already toasted
    }
  };

  // ── GitHub-routed message ────────────────────────────────────────────
  const sendGithubMessage = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pendingRunId) return;

    const connection = connections?.find((c) => c.name === "github-ask");
    if (!connection) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "No GitHub connection saved yet — add one in Settings." },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLastExchange({ question: trimmed, answer: "" }); // filled in once the run completes

    runAutomation.mutate(
      { connectionId: connection.id, extra: { question: trimmed } },
      { onSuccess: (run) => setPendingRunId(run.id) },
    );
  };

  return {
    messages,
    sendMessage,
    sendGithubMessage,
    isPending: chat.isPending || !!pendingRunId,
    lastExchange,
    createCard: (ex: { question: string; answer: string }) => createCardMutation.mutateAsync(ex),
    isCreatingCard: createCardMutation.isPending,
    hasGithubConnection: !!connections?.some((c) => c.name === "github-ask"),
  };
};