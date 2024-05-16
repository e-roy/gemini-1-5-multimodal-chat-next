// lib/validate/pro-request-schema.ts
import { z } from "zod";
import { messageSchema } from "./common";

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema),
  media: z.array(z.string()),
  media_types: z.array(z.string()),
});
