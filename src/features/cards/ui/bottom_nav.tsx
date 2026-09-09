"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpenCheck, Layers, NotebookPen } from "lucide-react";

const TABS = [
  { href: "/", label: "Review", icon: BookOpenCheck },
  { href: "/cards", label: "Cards", icon: Layers },
  { href: "/diary", label: "Diary", icon: NotebookPen },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-mono",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};