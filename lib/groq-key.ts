import prisma from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { TRPCError } from "@trpc/server";

export async function getUserGroqKey(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.groqApiKey) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Add your Groq API key first" });
  }
  return decrypt(user.groqApiKey);
}