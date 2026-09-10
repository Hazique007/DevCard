"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { useAssistantChat } from "../hooks/use_assistant_chat";
import { ChatMarkdown } from "@/src/features/cards/ui/chat_markdown";

export const FloatingChatButton = () => {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, isPending, lastExchange, createCard, isCreatingCard } = useAssistantChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  // Tap outside to close
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        ref={triggerRef}
        size="icon"
        className="fixed right-4 sm:right-6 sm:bottom-6 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] size-14 rounded-full shadow-lg z-50"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>

      {open && (
        <div
          ref={panelRef}
          className={cn(
            "fixed rounded-xl border bg-background shadow-2xl flex flex-col z-50 overflow-hidden",
            // Mobile: near-fullscreen, small margin on all sides, stops above the bottom nav
            "inset-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)]",
            // Desktop: back to the compact floating panel
            "sm:inset-auto sm:top-auto sm:left-auto sm:bottom-24 sm:right-6 sm:w-[min(380px,calc(100vw-2rem))] sm:h-[500px] sm:max-h-[70vh]"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <p className="font-medium text-sm">Ask DevCards</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                disabled={!lastExchange || isCreatingCard}
                onClick={() => lastExchange && createCard(lastExchange)}
              >
                {isCreatingCard ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                Create card
              </Button>
              {isMobile && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0 px-4">
            <div className="py-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ask me anything — you can save any answer as a card.
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 max-w-[85%] text-sm break-words",
                      m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm",
                    )}
                  >
                    <ChatMarkdown content={m.content} isUser={m.role === "user"} />
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t shrink-0">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="min-h-10 max-h-32 resize-none"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isPending} className="shrink-0">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};