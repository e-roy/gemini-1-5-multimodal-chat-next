// api/gemini-vision/route.ts
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  Part,
  Content,
} from "@google/generative-ai";

import { visionRequestSchema } from "@/lib/validate/vision-request-schema";

export const runtime = "edge";

export async function POST(req: Request) {
  const parseResult = visionRequestSchema.safeParse(await req.json());

  if (!parseResult.success) {
    // If validation fails, return a 400 Bad Request response
    return new Response(JSON.stringify({ error: "Invalid request data" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { messages, data } = parseResult.data;

  const imagePart: Part = {
    inlineData: {
      mimeType: data?.media_types || "",
      data: data?.media || "",
    },
  };

  const audioPart: Part = {
    inlineData: {
      mimeType: "audio/mp3",
      data: data?.audio || "",
    },
  };

  const parts: Part[] = [];
  if (data?.media) {
    parts.push(imagePart);
  }
  if (data?.audio) {
    parts.push(audioPart);
  }

  const typedMessages: Message[] = messages as unknown as Message[];

  const reqContent: GenerateContentRequest = {
    contents: typedMessages.reduce(
      (acc: Content[], m: Message, index: number) => {
        if (m.role === "user") {
          const lastContent = acc[acc.length - 1];
          if (lastContent && lastContent.role === "user") {
            lastContent.parts.push({ text: m.content });
          } else {
            acc.push({
              role: "user",
              parts: [{ text: m.content }],
            });
          }
        } else if (m.role === "assistant") {
          acc.push({
            role: "model",
            parts: [{ text: m.content }],
          });
        }

        if (index === typedMessages.length - 1 && m.role === "user") {
          const lastUserContent = acc[acc.length - 1];
          if (lastUserContent && lastUserContent.role === "user") {
            lastUserContent.parts.push(...parts);
          }
        }

        return acc;
      },
      []
    ),
  };

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

  const geminiStream = await genAI
    .getGenerativeModel({
      model: "gemini-1.5-pro-latest",
    })
    .generateContentStream(reqContent);

  const stream = GoogleGenerativeAIStream(geminiStream);

  return new StreamingTextResponse(stream);
}
