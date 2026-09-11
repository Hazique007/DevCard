"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserRound,Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export const UserMenu = () => {
  const router = useRouter();

  async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}



const goToSettings=()=>{

  return (
    router.push("/settings")
  )
}

  return (
    <DropdownMenu>
  <DropdownMenuTrigger
    render={
      <button
        className="flex items-center justify-center size-8 rounded-full border border-border text-foreground shrink-0"
        aria-label="Account menu"
      >
        <UserRound className="size-4" />
      </button>
    }
  />

  <DropdownMenuContent align="end" className="w-40">
    <DropdownMenuItem onClick={goToSettings} className="text-sm gap-2">
      <Settings className="size-4" />
      Settings
    </DropdownMenuItem>

    <DropdownMenuItem onClick={handleLogout} className="text-sm gap-2">
      <LogOut className="size-4" />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  );
};