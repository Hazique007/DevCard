"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { CreateCardDialog } from "@/src/features/cards/ui/create_card_dialog";
import { UserMenu } from "@/src/features/cards/ui/user_menu";
import { BottomNav } from "@/src/features/cards/ui/bottom_nav";
import { Plus } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Review" },
  { href: "/cards", label: "Cards" },
  { href: "/diary", label: "Diary" },
];

export const SiteNav = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <>
      <nav className="border-b border-border bg-background sticky top-0 z-10">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 h-14 gap-3">
          <Link href="/" className="font-mono text-sm font-medium tracking-tight shrink-0">
            devcards
          </Link>

          {!isMobile && (
            <div className="flex items-center gap-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "font-mono text-sm pb-[18px] pt-[18px] border-b-2 -mb-px transition-colors whitespace-nowrap",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {isMobile ? (
              <CreateCardDialog
                trigger={
                  <button
                    className="flex items-center justify-center size-8 rounded-full border border-border text-foreground"
                    aria-label="New card"
                  >
                    <Plus className="size-4" />
                  </button>
                }
              />
            ) : (
              <CreateCardDialog />
            )}
            <UserMenu />
          </div>
        </div>
      </nav>

      {isMobile && <BottomNav />}
    </>
  );
};