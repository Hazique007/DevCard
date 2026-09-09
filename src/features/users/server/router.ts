import { encrypt } from "@/lib/crypto";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";




export const userRouter = createTRPCRouter({


    getMe:protectedProcedure
    .query(async({ctx})=>{
        const user = await prisma.user.findUnique({
            where:{id:ctx.userId}
        })

        return {email:user?.email,hasGroqKey: !!user?.groqApiKey,name:user?.name}
    }),


    setGroqKey:protectedProcedure
    .input(z.object({
        apiKey:z.string().min(10)
    }))
    .mutation(async({ctx,input})=>{
     await prisma.user.update({
        where:{id:ctx.userId},
        data:{groqApiKey:encrypt(input.apiKey)}
     })

     return {ok:true}

    }),

    clearGroqKey:protectedProcedure
    .mutation(async({ctx})=>{
        await prisma.user.update({
            where:{id:ctx.userId},
            data:{groqApiKey:null}
        })
        return {ok:true}
    })

})