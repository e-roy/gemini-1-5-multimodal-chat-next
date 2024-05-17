// api/chat/route.ts
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
    return new Response(JSON.stringify({ error: "Invalid request data" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { messages, data } = parseResult.data;

  const parts: Part[] = [];

  if (data?.media) {
    parts.push({
      inlineData: {
        mimeType: data.media_types || "",
        data: data.media,
      },
    });
  }

  if (data?.audio) {
    parts.push({
      inlineData: {
        mimeType: "audio/mp3",
        data: data.audio,
      },
    });
  }

  const typedMessages = messages as Message[];

  const reqContent: GenerateContentRequest = {
    contents: typedMessages.reduce<Content[]>((acc, m, index) => {
      if (m.role === "user") {
        const lastContent = acc[acc.length - 1];
        if (lastContent?.role === "user") {
          lastContent.parts.push({ text: m.content });
        } else {
          acc.push({
            role: "user",
            parts: [{ text: m.content }],
          });
        }

        if (index === typedMessages.length - 1) {
          acc[acc.length - 1]?.parts.push(...parts);
        }
      } else if (m.role === "assistant") {
        acc.push({
          role: "model",
          parts: [{ text: m.content }],
        });
      }

      return acc;
    }, []),
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
