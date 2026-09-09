import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/db";
import { getUserGroqKey } from "@/lib/groq-key";

export const assistantRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(z.object({
      question: z.string().min(1).max(2000),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).max(20).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await getUserGroqKey(ctx.userId);
      const systemPrompt = `You are the DevCards assistant, a general study companion for a personal spaced-repetition app for programming knowledge. Help the user think through concepts, debug reasoning, or explain ideas. Keep answers focused and use code blocks for code.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "system", content: systemPrompt }, ...input.history, { role: "user", content: input.question }],
          temperature: 0.4,
          max_tokens: 800,
          reasoning_effort: "low",
        }),
      });

      if (!res.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Assistant is unavailable right now" });
      const data = await res.json();
      return { answer: data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response." };
    }),

  createCardFromChat: protectedProcedure
    .input(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await getUserGroqKey(ctx.userId);

      const summaryRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: "Condense the following into a concise flashcard answer — a few sentences max, no preamble. Return only the condensed text." },
            { role: "user", content: input.answer },
          ],
          temperature: 0.2,
          max_tokens: 300,
        }),
      });

      const summaryData = summaryRes.ok ? await summaryRes.json() : null;
      const back = summaryData?.choices?.[0]?.message?.content?.trim() || input.answer.slice(0, 500);

      return prisma.card.create({
        data: { userId: ctx.userId, front: input.question, back, category: "chat", tags: [] },
      });
    }),
});