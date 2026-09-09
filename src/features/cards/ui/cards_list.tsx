"use client";

import { useState } from "react";
import { useDebounce } from "@/lib/use-debounce";
import { useCardsList, useDeleteCard } from "../hooks/use-cards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

export const CardsList = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCardsList({ search: debouncedSearch, category });

  const deleteCard = useDeleteCard();

  const cards = data?.pages.flatMap((page) => page.cards) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No cards yet — add your first one above.
        </p>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{card.front}</p>
                <p className="text-sm text-muted-foreground">{card.back}</p>
                <div className="flex gap-2 items-center pt-1">
                  {card.category && (
                    <Badge variant="secondary">{card.category}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(card.dueAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
              className="cursor-pointer"
                variant="ghost"
                size="icon"
                onClick={() => deleteCard.mutate({ id: card.id })}
              >
                <Trash2 className="size-4 text-destructive cursor-pointer" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
};