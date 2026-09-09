"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { CreateCardDialog } from "@/src/features/cards/ui/create_card_dialog";
import { Plus } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Review" },
  { href: "/cards", label: "Cards" },
  { href: "/diary", label: "Diary" },
];

const SWIPE_THRESHOLD_PX = 60;

export const SiteNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const touchStartX = useRef<number | null>(null);

  const currentIndex = NAV_LINKS.findIndex((l) => l.href === pathname);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || currentIndex === -1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    // Swipe left -> next tab, swipe right -> previous tab
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    const target = NAV_LINKS[nextIndex];
    if (target) router.push(target.href);
  };

  return (
    <nav
      className="border-b border-border bg-background sticky top-0 z-10"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 h-14 gap-3">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight shrink-0"
          aria-label="Go to Review"
        >
          devcards
          {/* {isMobile ? (
            <span className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-xs">
              DC
            </span>
          ) : (
            "devcards"
          )} */}
        </Link>

        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-mono text-sm px-2 sm:px-0 pb-[18px] pt-[18px] border-b-2 -mb-px transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {isMobile ? (
          <CreateCardDialog
            trigger={
              <button
                className="flex items-center justify-center size-8 rounded-sm bg-primary text-primary-foreground shrink-0"
                aria-label="New card"
              >
                <Plus className="size-4" />
              </button>
            }
          />
        ) : (
          <CreateCardDialog />
        )}
      </div>
    </nav>
  );
};