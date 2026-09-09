import z from "zod";

export const CreateCardSchema = z.object({
  front: z.string().min(1, "Front is required").max(500),
  back: z.string().min(1, "Back is required").max(2000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string()),
});

export type CreateCardInput = z.infer<typeof CreateCardSchema>;