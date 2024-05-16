"use client";
// components/ChatContainer.tsx
import React, { useRef, useEffect, useState, FormEvent } from "react";
import { Message, useChat } from "ai/react";
import { CommonForm } from "./CommonForm";
import { MessageCircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatList } from "./message";
import { ChatRequestOptions } from "ai";
import { TypingBubble } from "./TypingBubble";

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
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    reload,
    isLoading,
  } = useChat({
    id: `chat-12345`,
    api: `/api/chat`,
    body: {},
  });

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmitForm = async (
    e: FormEvent<HTMLFormElement>,
    files?: File[]
  ) => {
    e.preventDefault();
    setLoading(true);

    console.log("Files", files);

    let imageBase64: string | null = null;
    let audioBase64: string | null = null;
    let mediaTypes: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const { base64 } = await convertFileToBase64(file);
          imageBase64 = base64;
          mediaTypes = file.type;
        } else if (file.type.startsWith("audio/")) {
          const { base64 } = await convertFileToBase64(file);
          audioBase64 = base64;
        }
      }
    }

    const options: ChatRequestOptions = {
      data: {
        media: imageBase64 || "",
        media_types: mediaTypes || "",
        audio: audioBase64 || "",
      },
    };

    console.log("options  ====>", options);
    console.log("messages ===>", messages);

    handleSubmit(e, options);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[95vh]">
      <div className="flex flex-col flex-1 overflow-hidden">
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
          {isLoading && <TypingBubble />}
        </div>
        <CommonForm
          value={input}
          loading={loading}
          onInputChange={handleInputChange}
          onFormSubmit={handleSubmitForm}
        />
      </div>
    </div>
  );
};
