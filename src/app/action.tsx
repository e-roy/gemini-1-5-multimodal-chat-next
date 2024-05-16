import "server-only";

// import OpenAI from "openai";
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  Content,
} from "@google/generative-ai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { z } from "zod";
import { BotCard, BotMessage } from "@/app/_components/message";
import { runOpenAICompletion } from "@/lib/chat-utils";
import { transcribeAudio } from "@/lib/chat-utils/transcribe";
import { MarkdownViewer } from "@/app/_components/markdown-viewer/MarkdownViewer";
import { TypingBubble } from "@/app/_components/TypingBubble";
// import { ChatCompletionContentPart } from "openai/resources/chat/completions.mjs";

const systemMessages = `\
You are a helpful assistant chatting with the user.
You and the user can discuss information, in the chat UI.

Messages inside [] means that it's a chat UI element or a user event. For example:
- "[A image of a cute cat with soft fur and bright eyes, sitting comfortably on a cozy blanket.]" means that an interface a picture to the user with this discription.

You will chat with the user.

In case the user wants an image or a picture, call \`create_image\`.

`;

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || "",
// });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

async function submitUserMessage(
  content: string,
  imageBase64?: string | null,
  audioBase64?: string | null
) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  const userMessageContent: any[] = [
    {
      type: "text",
      text: content,
    },
  ];

  if (imageBase64) {
    userMessageContent.push({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${imageBase64}` },
    });
  }

  if (audioBase64) {
    const transcriptionText = await transcribeAudio(audioBase64);
    userMessageContent.push({
      type: "text",
      text: transcriptionText,
    });
  }

  aiState.update([
    ...aiState.get(),
    {
      role: "user",
      content: userMessageContent,
    },
  ]);

  console.log("----------------------------------------");
  console.log("content ===>", content);
  console.log("aiState.get() ===>", JSON.stringify(aiState.get(), null, 2));

  const reply = createStreamableUI(
    <BotMessage className="items-center">
      <TypingBubble />
    </BotMessage>
  );

  const completion = runOpenAICompletion(genAI, {
    model: "gemini-1.5-pro-latest",

    stream: true,
    messages: [
      {
        role: "system",

        // @ts-ignore
        content: [
          {
            type: "text",
            text: systemMessages,
          },
        ],
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: "create_image",
        description: "Create an image or picture for the user.",
        parameters: z.object({
          image_description: z.string().describe("A description of the image."),
        }),
      },
    ],
    temperature: 0.5,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(
      <BotMessage>
        <MarkdownViewer text={content} />
      </BotMessage>
    );
    if (isFinal) {
      reply.done();
      aiState.done([
        ...aiState.get(),
        { role: "assistant", content: [{ type: "text", text: content }] },
      ]);
    }
  });

  completion.onFunctionCall(
    "create_image",
    async ({ image_description }: { image_description: string }) => {
      // const response = await openai.images.generate({
      //   prompt: image_description,
      //   model: "dall-e-3",
      //   n: 1,
      //   size: "1024x1024",
      // });

      // const image = response.data[0];

      reply.update(<BotCard>update</BotCard>);

      reply.done(
        <BotCard>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img
            src={image.url}
            alt={image.revised_prompt}
            className={`h-64 w-64`}
          /> */}
          an image is here
        </BotCard>
      );

      aiState.done([
        ...aiState.get(),
        {
          role: "function",
          name: "create_image",
          content: [
            {
              type: "text",
              // text: `[Image of a ${image.revised_prompt}]`,
              text: `[Image of unknown content]`,
            },
          ],
        },
      ]);
    }
  );

  //
  return {
    id: Date.now(),
    display: reply.value,
  };
}

const initialAIState: {
  role: "user" | "assistant" | "system" | "function";
  content: any[];
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});
