"use client";
// components/ChatContainer.tsx
import React, { useRef, useEffect, useState, FormEvent } from "react";
import { Message, useChat } from "ai/react";
import { CommonForm } from "./CommonForm";
import { MessageCircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatList } from "./message";
import { convertFileToBase64 } from "@/lib/convert-file-to-base-64";

export const ChatContainer: React.FC = () => {
  const { messages, append, input, handleInputChange, setMessages, setInput } =
    useChat({
      id: "chat-12345",
      api: "/api/chat",
      body: {},
    });

  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
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
    setTyping(true);

    let imageBase64: string | null = null;
    let mediaType: string | null = null;
    let audioBase64: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        const { base64 } = await convertFileToBase64(file);
        if (file.type.startsWith("image/")) {
          imageBase64 = base64;
          mediaType = file.type;
        } else if (file.type.startsWith("audio/")) {
          audioBase64 = base64;
        }
      }
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input,
      role: "user",
      data: {
        image: imageBase64,
        audio: audioBase64,
      },
    };

    const options = {
      data: {
        media: imageBase64 || "",
        media_types: mediaType || "",
        audio: audioBase64 || "",
      },
    };

    setInput("");
    setLoading(false);

    await append(newMessage, options);

    setTyping(false);
  };

  return (
    <div className="flex flex-col h-[90vh] md:h-[95vh]">
      <div className="flex flex-col flex-1 overflow-hidden">
        {messages.length > 0 && (
          <div className="flex p-4">
            <Button
              variant="secondary"
              type="button"
              size="sm"
              onClick={() => setMessages([])}
            >
              <MessageCircleX className="mr-2" /> Clear chat history
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <ChatList messages={messages} typing={typing} />
          <div ref={messagesEndRef} />
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
