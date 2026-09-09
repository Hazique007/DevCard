"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const useAssistantChat = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastExchange, setLastExchange] = useState<{ question: string; answer: string } | null>(null);

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

  return {
    messages,
    sendMessage,
    isPending: chat.isPending,
    lastExchange,
    createCard: (ex: { question: string; answer: string }) => createCardMutation.mutateAsync(ex),
    isCreatingCard: createCardMutation.isPending,
  };
};