"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { CreateCardDialog } from "@/src/features/cards/ui/create_card_dialog";
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
    <nav className="border-b border-border bg-background">
      <div className="w-screen mx-auto flex items-center justify-between px-4 h-14 ">
        <div>
            <span className="font-mono text-sm font-medium tracking-tight">
            devcards
          </span>

        </div>
        <div className="flex items-center gap-6">
        

          <div className="flex items-center gap-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-mono text-sm pb-[18px] pt-[18px] border-b-2 -mb-px transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isMobile ? link.label.slice(0, 1).toUpperCase() : link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {isMobile ? (
          <CreateCardDialog trigger={
            <button className="flex items-center justify-center size-8 rounded-sm bg-primary text-primary-foreground">
              <Plus className="size-4" />
            </button>
          } />
        ) : (
          <CreateCardDialog />
        )}
      </div>
    </nav>
  );
};