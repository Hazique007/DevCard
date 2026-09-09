import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, inviteCode , name } = await req.json();

  if (inviteCode !== process.env.INVITE_CODE) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}