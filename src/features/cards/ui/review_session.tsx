"use client";

import { useState } from "react";
import { useSuspenseDueCards, useReviewCard } from "../hooks/use-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

const RATING_CONFIG: Record<Rating, { label: string; hint: string; className: string }> = {
  AGAIN: { label: "Again", hint: "<10m",  className: "bg-red-600 hover:bg-red-700 text-white" },
  HARD:  { label: "Hard",  hint: "1d",    className: "bg-orange-500 hover:bg-orange-600 text-white" },
  GOOD:  { label: "Good",  hint: "3d",    className: "bg-blue-600 hover:bg-blue-700 text-white" },
  EASY:  { label: "Easy",  hint: "6d",    className: "bg-green-600 hover:bg-green-700 text-white" },
};

export const ReviewSession = () => {
  const { data: dueCards } = useSuspenseDueCards();
  const reviewCard = useReviewCard();
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);

  const total = dueCards.length;
  const current = dueCards[index];

  if (!current) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-lg font-medium">All caught up</p>
        <p className="text-muted-foreground text-sm">No cards due right now.</p>
      </div>
    );
  }

  const handleRate = (rating: Rating) => {
    reviewCard.mutate({ cardId: current.id, rating });
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 space-y-4 px-4 sm:px-0">
      {/* Progress: which card is active, out of how many */}
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Card {index + 1} of {total}</span>
        {current.category && (
          <Badge variant="secondary" className="max-w-[50%] truncate">
            {current.category}
          </Badge>
        )}
      </div>
      <Progress value={(index / total) * 100} className="h-1.5" />

      <Card className="min-h-[260px] shadow-sm">
        <CardContent className="flex flex-col items-center justify-center text-center gap-5 p-8 sm:p-10 min-h-[260px]">
          <p
            className={cn(
              "text-xl font-medium transition-colors",
              revealed && "text-muted-foreground text-base font-normal"
            )}
          >
            {current.front}
          </p>
          {revealed && (
            <>
              <div className="w-full border-t" />
              <p className="text-xl font-semibold">{current.back}</p>
            </>
          )}
        </CardContent>
      </Card>

      {!revealed ? (
        <Button className="w-full" size="lg" onClick={() => setRevealed(true)}>
          Show answer
        </Button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(RATING_CONFIG) as Rating[]).map((rating) => (
            <Button
              key={rating}
              size="lg"
              className={cn("flex flex-col h-auto py-2.5 gap-0.5", RATING_CONFIG[rating].className)}
              onClick={() => handleRate(rating)}
            >
              <span className="font-medium">{RATING_CONFIG[rating].label}</span>
              <span className="text-[11px] opacity-80 font-normal">{RATING_CONFIG[rating].hint}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};