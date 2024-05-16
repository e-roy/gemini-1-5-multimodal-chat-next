import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Bot, Code, User } from "lucide-react";
import { MarkdownViewer } from "./markdown-viewer/MarkdownViewer";

export function ChatList({ messages }: { messages: Message[] }) {
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
            <UserMessage>
              <MarkdownViewer text={message.content} />
            </UserMessage>
          )}
          {message.role === "assistant" && (
            <BotMessage>
              <MarkdownViewer text={message.content} />
            </BotMessage>
          )}
          {message.role === "system" && (
            <SystemMessage>
              <MarkdownViewer text={message.content} />
            </SystemMessage>
          )}
        </div>
      ))}
    </div>
  );
}

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-background">
        <User />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative flex items-start md:-ml-12", className)}>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-primary text-primary-foreground">
        <Bot />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotCard({
  children,
  showAvatar = true,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm bg-primary text-primary-foreground",
          !showAvatar && "invisible"
        )}
      >
        <Code />
      </div>
      <div className="ml-4 flex-1 px-1 space-y-4">{children}</div>
    </div>
  );
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "mt-2 flex items-center justify-center gap-2 text-xs text-gray-500"
      }
    >
      <div className={"max-w-[600px] flex-initial px-2 py-2"}>{children}</div>
    </div>
  );
}
