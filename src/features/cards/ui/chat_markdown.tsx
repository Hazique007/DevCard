// src/features/cards/ui/chat-markdown.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

export const ChatMarkdown = ({ content, isUser }: { content: string; isUser: boolean }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Inline vs block code
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className={cn(
                  "rounded px-1.5 py-0.5 text-[0.85em] font-mono",
                  isUser ? "bg-primary-foreground/20" : "bg-foreground/10",
                )}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <div className="my-2 rounded-lg overflow-hidden text-xs">
              <SyntaxHighlighter
                language={match?.[1] ?? "text"}
                style={oneDark}
                customStyle={{ margin: 0, padding: "0.75rem" }}
                wrapLongLines
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        },

        // Tables — wrap so they scroll instead of overflowing the bubble
        table({ children }) {
          return (
            <div className="my-2 overflow-x-auto rounded-md border">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-foreground/5">{children}</thead>;
        },
        th({ children }) {
          return <th className="px-2 py-1.5 text-left font-medium border-b">{children}</th>;
        },
        td({ children }) {
          return <td className="px-2 py-1.5 border-b border-foreground/10 align-top">{children}</td>;
        },

        // Sensible defaults for the rest
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-2 last:mb-0 list-disc pl-4 space-y-0.5">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-2 last:mb-0 list-decimal pl-4 space-y-0.5">{children}</ol>;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};