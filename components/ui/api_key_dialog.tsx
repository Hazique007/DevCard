"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { useGetMe, useSetGroqApiKey } from "@/src/features/users/hooks/use-users";


export const ApiKeyDialog = () => {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  const { data: me } = useGetMe();

  const setGroqKey = useSetGroqApiKey(setOpen, setKey);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger  render={
         <Button
          variant="outline"
          size="icon"
          title={me?.hasGroqKey ? "Groq key set" : "Add your Groq API key"}
        >
          <Key
            className={
              me?.hasGroqKey
                ? "size-4 text-green-600"
                : "size-4"
            }
          />
        </Button>

      }>
       
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Your Groq API key</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="groq-key">API key</Label>

          <Input
            id="groq-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
          />

          <p className="text-xs text-muted-foreground">
            Used for card chat and the assistant. Stored encrypted,
            never shown again after saving.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={() => setGroqKey.mutate({ apiKey: key })}
            disabled={!key.trim() || setGroqKey.isPending}
          >
            Save key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};