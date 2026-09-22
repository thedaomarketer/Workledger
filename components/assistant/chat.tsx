"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How many hours did I work this week?",
  "How much did I earn last month?",
  "Show me shifts longer than 10 hours",
  "Summarize my work activity this month",
];

export function AssistantChat({
  initialConversationId,
  initialMessages,
}: {
  initialConversationId: string | null;
  initialMessages: ChatMessage[];
}) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    scrollToBottom();

    startTransition(async () => {
      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: conversationId ?? undefined, message: trimmed }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "The assistant couldn't respond.");
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        setConversationId(data.conversationId);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        scrollToBottom();
      } catch {
        toast.error("The assistant couldn't respond. Check your connection and try again.");
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setInput("");
  }

  return (
    <Card className="flex h-[calc(100svh-10rem)] flex-col md:h-[calc(100svh-7rem)]">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-primary" />
          AI Assistant
        </div>
        <Button variant="ghost" size="sm" onClick={newConversation} disabled={messages.length === 0}>
          <Plus /> New chat
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Sparkles className="size-8 text-muted-foreground" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Ask about your hours, earnings, shifts, expenses, or schedule. Answers come straight from
              your WorkLedger records.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={i}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask about your hours, earnings, or schedule..."
          rows={1}
          className="max-h-32 min-h-9 resize-none"
        />
        <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </Card>
  );
}
