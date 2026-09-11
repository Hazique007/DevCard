// app/api/automation-callback/[runId]/route.ts — also fully generic, no shape assumptions
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const resultPayload = await req.json();

  await prisma.automationRun.update({
    where: { id: runId },
    data: { status: "DONE", resultPayload, completedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}