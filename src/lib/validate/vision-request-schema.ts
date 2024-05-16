// lib/validate/vision-request-schema.ts
import { z } from "zod";
import { messageSchema } from "./common";

export const visionRequestSchema = z.object({
  messages: z.array(messageSchema),
  data: z
    .object({
      media: z.string().nullable().optional(),
      media_types: z.string().nullable().optional(),
      audio: z.string().nullable().optional(),
    })
    .optional(),
});
