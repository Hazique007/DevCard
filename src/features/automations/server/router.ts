// features/automations/server/router.ts
import crypto from "node:crypto";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const automationsRouter = createTRPCRouter({
 
createConnection: protectedProcedure
  .input(z.object({ name: z.string().min(1), webhookUrl: z.string().url(), webhookSecret: z.string().optional() }))
  .mutation(async ({ ctx, input }) => {
    return prisma.automationConnection.upsert({
      where: { userId_name: { userId: ctx.userId, name: input.name } },
      create: { userId: ctx.userId, ...input },
      update: { webhookUrl: input.webhookUrl, webhookSecret: input.webhookSecret },
    });
  }),

  listConnections: protectedProcedure.query(async ({ ctx }) => {
    return prisma.automationConnection.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Fires ANY connection, regardless of what it does — fully generic
  run: protectedProcedure
    .input(z.object({ connectionId: z.string(), extra: z.record(z.string(), z.any()).default({}) }))
    .mutation(async ({ ctx, input }) => {
      const connection = await prisma.automationConnection.findUniqueOrThrow({
        where: { id: input.connectionId, userId: ctx.userId },
      });

      const run = await prisma.automationRun.create({
        data: { connectionId: connection.id, status: "PENDING", requestPayload: input.extra },
      });

      const body = JSON.stringify({
        runId: run.id,
        callbackUrl: `${process.env.APP_URL}/api/automation-callback/${run.id}`,
        ...input.extra,
      });

      if (connection.webhookSecret) {
        const timestamp = Date.now().toString();
        const signature = crypto
          .createHmac("sha256", connection.webhookSecret)
          .update(timestamp + body)
          .digest("hex");
        await fetch(connection.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-webhook-signature": signature, "x-webhook-timestamp": timestamp },
          body,
        });
      } else {
        await fetch(connection.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }

      return run;
    }),

  getRun: protectedProcedure
    .input(z.object({ runId: z.string() }))
    .query(async ({ input }) => prisma.automationRun.findUniqueOrThrow({ where: { id: input.runId } })),
});