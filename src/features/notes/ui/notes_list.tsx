"use client";

import { useState } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useNotesList, useDeleteNotes } from "../hooks/use-notes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

export const NotesList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotesList(debouncedSearch);
  const deleteNote = useDeleteNotes();

  const notes = data?.pages.flatMap((p) => p.notes) ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      <Input
        placeholder="Search by file, title, or reasoning"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="font-mono text-sm w-full sm:max-w-sm"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="border border-dashed border-border rounded-sm py-24 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            No notes yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group border border-border rounded-sm p-4 flex flex-col gap-3 min-w-0"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-xs text-muted-foreground break-all min-w-0">
                  {note.filePath}
                </p>
                <button
                  onClick={() => deleteNote.mutate({ id: note.id })}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-rust shrink-0"
                  aria-label="Delete note"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <h3 className="font-mono text-sm font-medium break-words">{note.title}</h3>

              <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4 break-words">
                {note.reasoning}
              </p>

              {note.codeSnippet && (
                <pre className="bg-paper-raised border border-border rounded-sm p-3 text-xs font-mono overflow-x-auto max-h-32 max-w-full">
                  <code>{note.codeSnippet}</code>
                </pre>
              )}

              <p className="font-mono text-xs text-muted-foreground/60 mt-auto pt-1">
                {new Date(note.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full font-mono text-sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading" : "Load more"}
        </Button>
      )}
    </div>
  );
};