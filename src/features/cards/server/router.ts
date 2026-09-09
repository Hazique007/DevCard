import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { calculateNextReview } from "@/lib/sm2";
import { CreateCardSchema } from "../schema";
import { getUserGroqKey } from "@/lib/groq-key";




export const cardsRouter = createTRPCRouter({
  getDueCards: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return prisma.card.findMany({
        where: {
          userId: ctx.userId,
          dueAt: { lte: new Date() },
        },

        orderBy: { dueAt: "asc" },
        take: input.limit,
      });
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        search: z.string().default(""),
        category: z.string().default(""),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, category, cursor, limit } = input;

      const where = {
        userId: ctx.userId,
        ...(search
          ? {
              OR: [
                {
                  front: { contains: search, mode: "insensitive" as const },
                },
                {
                  back: { contains: search, mode: "insensitive" as const },
                },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      };

      const items = await prisma.card.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      const hasNextPage = items.length > limit;
      const cards = hasNextPage ? items.slice(0, -1) : items;
      const nextCursor = hasNextPage ? cards[cards.length - 1].id : null;

      return { cards, nextCursor };
    }),


    askCard:protectedProcedure
    .input(
      z.object({
        cardId:z.string(),
        question:z.string().min(1).max(2000),
        history:z.array(z.object({
          role:z.enum(["user","assistant"]),
          content:z.string()
        })).max(20).default([])
      })
    ).mutation(async({ctx,input})=>{
      const card = await prisma.card.findUnique({
        where:{id:input.cardId,userId:ctx.userId}
      });
      if(!card){
         throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

       const systemPrompt = `You are a study assistant inside DevCard, a personal spaced-repetition app for logging programming knowledge.

You're helping the user understand this specific card:
Front: ${card.front}
Back: ${card.back}
Category: ${card.category ?? "none"}
Tags: ${card.tags.join(", ") || "none"}

Answer questions about this card — clarify, give examples, explain edge cases, relate it to broader concepts. If asked something unrelated to this card's topic, gently steer back. Keep answers focused and use code blocks for code.`;

const apiKey = await getUserGroqKey(ctx.userId);
const groqRes= await fetch("https://api.groq.com/openai/v1/chat/completions",{
  method:"POST",
  headers:{
     "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
  },
  body:JSON.stringify({
    model:"openai/gpt-oss-120b",
      messages: [
          { role: "system", content: systemPrompt },
          ...input.history,
          { role: "user", content: input.question },
        ],
        temperature: 0.4,
        max_tokens: 800,
        reasoning_effort: "low",
  })
})

if(!groqRes.ok){
   console.error("Groq API error", await groqRes.text());
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Assistant is unavailable right now",
      });
}

const data = await groqRes.json()

const answer: string =
      data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

      return { answer }

    }),

  create: protectedProcedure
    .input(
     CreateCardSchema
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.card.create({
        data: {
          userId: ctx.userId,
          front: input.front,
          back: input.back,
          category: input.category,
          tags: input.tags,
        },
      });
    }),

  review: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        rating: z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await prisma.card.findUnique({
        where: { id: input.cardId, userId: ctx.userId },
      });

      if (!card) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      const next = calculateNextReview(
        {
          easeFactor: card.easeFactor,
          intervalDays: card.intervalDays,
          repetitions: card.repetitions,
        },
        input.rating,
      );

      const [updatedCard] = await prisma.$transaction([
        prisma.card.update({
          where: { id: card.id },
          data: {
            easeFactor: next.easeFactor,
            intervalDays: next.intervalDays,
            repetitions: next.repetitions,
            dueAt: next.dueAt,
          },
        }),

        prisma.review.create({
          data: {
            cardId: card.id,
            userId: ctx.userId,
            rating: input.rating,
            intervalDays: next.intervalDays,
          },
        }),
      ]);
      return updatedCard;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [dueCount, totalCards, reviewsToday, ratingBreakdown] =
      await Promise.all([
        prisma.card.count({
          where: { userId: ctx.userId, dueAt: { lte: new Date() } },
        }),

        prisma.card.count({ where: { userId: ctx.userId } }),
        prisma.review.count({
          where: {
            userId: ctx.userId,
            reviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.review.groupBy({
          by: ["rating"],
          where: { userId: ctx.userId },
          _count: true,
        }),
      ]);

    return { dueCount, totalCards, reviewsToday, ratingBreakdown };
  }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.card.delete({
        where: { id: input.id, userId: ctx.userId },
      });
    }),
});
