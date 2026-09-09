"use client";

import { useCardStats } from "../hooks/use-cards";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const StatsDashboard = () => {
  const { data, isLoading } = useCardStats();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Due now", value: data.dueCount, accent: data.dueCount > 0 && "text-orange-600" },
    { label: "Total cards", value: data.totalCards,accent:"text-red" },
    { label: "Reviewed today", value: data.reviewsToday, accent: "text-green-600" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-1.5">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-snug">
              {stat.label}
            </p>
            <p className={cn("text-2xl sm:text-3xl font-bold leading-none",stat.accent)}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};