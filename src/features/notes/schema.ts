import z from "zod";




export const createNoteSchema= z.object({
  filePath: z.string().min(1, "File path is required").max(300),
  title: z.string().min(1, "Title is required").max(150),
  reasoning: z.string().min(1, "Explain your reasoning").max(3000),
  codeSnippet: z.string().max(5000).optional(),
  tags: z.array(z.string()),
})


export type CreateNoteInput = z.infer<typeof createNoteSchema>