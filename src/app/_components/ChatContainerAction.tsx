"use client";
// components/ChatContainer.tsx
import React, {
  useRef,
  useEffect,
  useState,
  FormEvent,
  useCallback,
} from "react";
import { Card } from "@/components/ui/card";
import { CommonForm } from "./CommonForm";
import { MessageCircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIState, useActions } from "ai/rsc";
import { type AI } from "../action";
import { ChatList, UserMessage } from "./message";

const convertFileToBase64 = async (
  file: File
): Promise<{ base64: string; fileUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve({ base64: base64String, fileUrl: reader.result as string });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const ChatContainer = () => {
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleResetForm = useCallback(() => {
    setInputValue("");
  }, []);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    files?: File[]
  ) => {
    e.preventDefault();
    setLoading(true);

    console.log("Files", files);

    let imageBase64: string | null = null;
    let audioBase64: string | null = null;
    let audioUrl: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const { base64 } = await convertFileToBase64(file);
          imageBase64 = base64;
        } else if (file.type.startsWith("audio/")) {
          const { base64, fileUrl } = await convertFileToBase64(file);
          audioBase64 = base64;
          audioUrl = fileUrl;
        }
      }
    }

    const newMessage = {
      id: Date.now(),
      display: (
        <UserMessage>
          {inputValue}
          {imageBase64 && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${imageBase64}`}
                alt="Uploaded"
                className="max-w-full h-auto"
              />
            </div>
          )}
          {audioUrl && (
            <div className="mt-2">
              <audio controls src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </UserMessage>
      ),
    };

    setMessages((currentMessages: any) => [...currentMessages, newMessage]);
    handleResetForm();

    try {
      const responseMessage = await submitUserMessage(
        inputValue,
        imageBase64,
        audioBase64
      );
      setMessages((currentMessages: any) => [
        ...currentMessages,
        responseMessage,
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[95vh]">
      <Card className="flex flex-col flex-1 overflow-hidden">
        {messages.length > 0 && (
          <div className={`flex p-4`}>
            <Button
              variant={`secondary`}
              type={`button`}
              size={`sm`}
              onClick={() => setMessages([])}
            >
              <MessageCircleX className={`mr-2`} /> Clear chat history
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {messages && <ChatList messages={messages} />}
          <div ref={messagesEndRef} />
        </div>
        <CommonForm
          value={inputValue}
          loading={loading}
          onInputChange={(e) => setInputValue(e.target.value)}
          onFormSubmit={handleSubmit}
          onResetForm={handleResetForm}
        />
      </Card>
    </div>
  );
};
