import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { createNoteSchema } from "../schema";

export const notesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        search: z.string().default(""),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, cursor, limit } = input;

      const items = await prisma.projectNote.findMany({
        where: {
          userId: ctx.userId,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" as const } },
                  {
                    filePath: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    reasoning: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

       const hasNextPage = items.length > limit;
      const notes = hasNextPage ? items.slice(0, -1) : items;
      const nextCursor = hasNextPage ? notes[notes.length - 1].id : null;

      return { notes, nextCursor };


    }),

    create:protectedProcedure
    .input(createNoteSchema)
    .mutation(async({ctx,input})=>{
        return prisma.projectNote.create({
            data:{userId:ctx.userId,...input}
        })
    }),


    remove:protectedProcedure
    .input(z.object({
      id:z.string()
    }))
    .mutation(async({ctx,input})=>{
        return prisma.projectNote.delete({
            where:{
                id:input.id,userId:ctx.userId
            }
        })
    })





});
