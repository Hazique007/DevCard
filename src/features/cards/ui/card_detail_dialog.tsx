// src/features/cards/ui/card-detail-dialog.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/lib/hooks/use-mobile"; // <- your existing hook, adjust path
import { useChatCard } from "../hooks/use-cards";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./chat_markdown";

type CardData = {
  id: string;
  front: string;
  back: string;
  category: string | null;
  tags: string[];
};

interface CardDetailDialogProps {
  card: CardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CardDetailDialog = ({ card, open, onOpenChange }: CardDetailDialogProps) => {
  const isMobile = useIsMobile();

  if (!card) return null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[92vh] flex flex-col p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{card.front}</DrawerTitle>
            <DrawerDescription>Card details and chat</DrawerDescription>
          </DrawerHeader>
          <CardChatBody card={card} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{card.front}</DialogTitle>
          <DialogDescription>Card details and chat</DialogDescription>
        </DialogHeader>
        <CardChatBody card={card} />
      </DialogContent>
    </Dialog>
  );
};


const CardChatBody = ({ card }: { card: CardData }) => {
  const { messages, sendMessage, isPending, reset } = useChatCard(card.id);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

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
    <div className="flex flex-col h-full min-h-0">
      {/* Card content */}
      <div className="p-4 sm:p-6 border-b space-y-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {card.category && <Badge variant="secondary">{card.category}</Badge>}
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-base sm:text-lg leading-snug">{card.front}</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {card.back}
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <div className="py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
                <Sparkles className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground max-w-xs">
                  Ask anything about this card — deeper explanations, examples, edge cases.
                </p>
              </div>
            )}

          {messages.map((m, i) => (
  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
    <div
      className={cn(
        "rounded-2xl px-4 py-2 max-w-[85%] text-sm break-words",
        m.role === "user"
          ? "bg-primary text-primary-foreground rounded-br-sm"
          : "bg-muted rounded-bl-sm",
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

        <div className="p-3 sm:p-4 border-t shrink-0 bg-background">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this card..."
              rows={1}
              className="min-h-10 max-h-32 resize-none"
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isPending} className="shrink-0">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

