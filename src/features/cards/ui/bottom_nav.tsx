"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { BookOpenCheck, Layers, NotebookPen, Loader2 } from "lucide-react";

const TABS = [
  { href: "/", label: "Review", icon: BookOpenCheck },
  { href: "/cards", label: "Cards", icon: Layers },
  { href: "/diary", label: "Diary", icon: NotebookPen },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Once the real route catches up to the tab we optimistically activated,
  // drop the override and let pathname drive things again.
  useEffect(() => {
    if (pendingHref && pathname === pendingHref) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  const activeHref = pendingHref ?? pathname;

  const handleClick = (href: string) => (e: React.MouseEvent) => {
    if (href === pathname) return;
    e.preventDefault();
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = activeHref === href;
          const isLoading = isPending && pendingHref === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClick(href)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-mono transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};