"use client";

import { useState } from "react";
import { useConnections, useCreateConnection } from "@/src/features/automations/hooks/use-automations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Plus } from "lucide-react";

export default function SettingsPage() {
  const { data: connections, isLoading } = useConnections();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage connections used by DevCards.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
            <Plus className="size-4" />
            New connection
          </Button>
        </div>

        {showForm && (
          <ConnectionForm onSaved={() => setShowForm(false)} />
        )}

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && connections?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No connections yet. Add one to start using automations.
            </p>
          )}
          {connections?.map((conn) => (
            <div key={conn.id} className="rounded-xl border bg-background p-4">
              <p className="text-sm font-medium font-mono">{conn.name}</p>
              <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
                {conn.webhookUrl}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectionForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const createConnection = useCreateConnection();

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;
    createConnection.mutate(
      { name: name.trim(), webhookUrl: url.trim() },
      { onSuccess: onSaved },
    );
  };

  return (
    <div className="mt-6 rounded-xl border bg-background p-4 sm:p-6 space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="conn-name" className="text-sm font-medium leading-none">
          Name
        </label>
        <p className="text-xs text-muted-foreground">
          A short identifier, e.g. <code>github-ask</code>. This is how DevCards
          refers to this connection internally.
        </p>
        <Input
          id="conn-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="github-ask"
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="conn-url" className="text-sm font-medium leading-none">
          Webhook URL
        </label>
        <p className="text-xs text-muted-foreground">
          Paste the generic webhook URL from your autom8ai workspace.
        </p>
        <Input
          id="conn-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.autom8ai.io/api/webhooks/generic/..."
          className="font-mono text-xs sm:text-sm"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>

      <Button onClick={handleSave} disabled={!name.trim() || !url.trim() || createConnection.isPending}>
        {createConnection.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Save connection
      </Button>
    </div>
  );
}