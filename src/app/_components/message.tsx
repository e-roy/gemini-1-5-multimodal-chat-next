/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Bot, Code, User } from "lucide-react";
import { MarkdownViewer } from "./markdown-viewer/MarkdownViewer";
import { MessageData } from "@/types";
import { TypingBubble } from "./TypingBubble";

interface ChatListProps {
  messages: Message[];
  typing: boolean;
}

export function ChatList({ messages, typing }: ChatListProps) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto sm:max-w-2xl lg:max-w-4xl px-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className="py-6 border-b border-neutral-800/80 whitespace-pre-line"
        >
          {message.role === "user" && (
            <MessageBubble icon={<User />}>
              <MessageContent message={message} />
            </MessageBubble>
          )}
          {message.role === "assistant" && (
            <MessageBubble
              icon={<Bot />}
              iconClassName="bg-primary text-primary-foreground"
            >
              <MessageContent message={message} />
            </MessageBubble>
          )}
          {message.role === "system" && (
            <MessageBubble
              icon={<Code />}
              iconClassName={"bg-primary text-primary-foreground"}
            >
              <MessageContent message={message} />
            </MessageBubble>
          )}
        </div>
      ))}
      {typing && <TypingBubble />}
    </div>
  );
}

interface MessageContentProps {
  message: Message;
}

const MessageContent: React.FC<MessageContentProps> = ({ message }) => {
  const { content, data } = message;
  const { image, audio } = (data as MessageData) || {};

  return (
    <div className="space-y-2">
      <MarkdownViewer text={content} />
      {image && (
        <img
          src={`data:image/jpeg;base64,${image}`}
          alt="User upload"
          className="max-w-full h-auto"
        />
      )}
      {audio && (
        <audio controls>
          <source src={`data:audio/mp3;base64,${audio}`} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  icon: React.ReactNode;
  iconClassName?: string;
  children: React.ReactNode;
}

function MessageBubble({ icon, iconClassName, children }: MessageBubbleProps) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-background",
          iconClassName
        )}
      >
        {icon}
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}
