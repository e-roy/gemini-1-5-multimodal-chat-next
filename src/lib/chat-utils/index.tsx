import { ToolDefinition } from "./tool-definition";
import { OpenAIStream, GoogleGenerativeAIStream } from "ai";
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  Content,
} from "@google/generative-ai";
import type OpenAI from "openai";
import zodToJsonSchema from "zod-to-json-schema";

// declare function OpenAIStream(
//   res: Response | AsyncIterableOpenAIStreamReturnTypes,
//   callbacks?: OpenAIStreamCallbacks
// ): ReadableStream;

// declare function GoogleGenerativeAIStream(
//   response: {
//     stream: AsyncIterable<GenerateContentResponse>;
//   },
//   cb?: AIStreamCallbacksAndOptions
// ): ReadableStream;

const consumeStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
};

export function runOpenAICompletion<
  T extends Omit<
    Parameters<typeof OpenAI.prototype.chat.completions.create>[0],
    "functions"
  > & {
    functions: ToolDefinition<any, any>[];
  }
>(genAI: GoogleGenerativeAI, params: T) {
  let text = "";
  let hasFunction = false;

  type FunctionNames = T["functions"] extends Array<any>
    ? T["functions"][number]["name"]
    : never;

  let onTextContent: (text: string, isFinal: boolean) => void = () => {};

  let onFunctionCall: Record<string, (args: Record<string, any>) => void> = {};

  const { functions, ...rest } = params;

  (async () => {
    consumeStream(
      GoogleGenerativeAIStream(
        (await genAI.getGenerativeModel({
          // ...rest,
          model: "gemini-1.5-pro-latest",
          toolConfig: {
            functionCallingConfig: {
              // mode: "ANY",
              allowedFunctionNames: params.functions.map((fn) => fn.name),
            },
          },

          // stream: true,
          // functions: functions.map((fn) => ({
          //   name: fn.name,
          //   description: fn.description,
          //   parameters: zodToJsonSchema(fn.parameters) as Record<
          //     string,
          //     unknown
          //   >,
          // })),
        })) as any,
        {
          // async experimental_onFunctionCall(functionCallPayload) {
          //   hasFunction = true;
          //   onFunctionCall[
          //     functionCallPayload.name as keyof typeof onFunctionCall
          //   ]?.(functionCallPayload.arguments as Record<string, any>);
          // },
          onToken(token) {
            text += token;
            if (text.startsWith("{")) return;
            onTextContent(text, false);
          },
          onFinal() {
            if (hasFunction) return;
            onTextContent(text, true);
          },
        }
      )
    );
  })();

  return {
    onTextContent: (
      callback: (text: string, isFinal: boolean) => void | Promise<void>
    ) => {
      onTextContent = callback;
    },
    onFunctionCall: (
      name: FunctionNames,
      callback: (args: any) => void | Promise<void>
    ) => {
      onFunctionCall[name] = callback;
    },
  };
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
