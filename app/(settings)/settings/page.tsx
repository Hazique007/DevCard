// app/settings/page.tsx
"use client";

import { useState } from "react";
import { useCreateConnection } from "@/src/features/automations/hooks/use-automations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const createConnection = useCreateConnection();

  const handleSave = () => {
    if (!url.trim()) return;
    createConnection.mutate({ name: "github-ask", webhookUrl: url });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="text-lg font-semibold sm:text-xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage connections used by DevCards.
        </p>

        <div className="mt-6 rounded-xl border bg-background p-4 sm:p-6">
          <div className="space-y-1.5">
            <label
              htmlFor="webhook-url"
              className="text-sm font-medium leading-none"
            >
              webhook URL (GitHub)
            </label>
            <p className="text-xs text-muted-foreground">
              Paste the generic webhook URL from your autom8ai workspace.
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="webhook-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.autom8ai.io/api/webhooks/generic/..."
              className="font-mono text-xs sm:text-sm"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <Button
              onClick={handleSave}
              disabled={!url.trim() || createConnection.isPending}
              className="w-full shrink-0 sm:w-auto"
            >
              {createConnection.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : createConnection.isSuccess ? (
                <Check className="size-4" />
              ) : (
                "Save"
              )}
            </Button>
          </div>

          {createConnection.isError && (
            <p className="mt-2 text-xs text-destructive">
              Couldn't save this connection. Check the URL and try again.
            </p>
          )}
          {createConnection.isSuccess && (
            <p className="mt-2 text-xs text-emerald-600">
              Connection saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}