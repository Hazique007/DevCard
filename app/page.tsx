import { HydrateClient } from "@/trpc/server";
import { requireSession } from "@/lib/auth";
import { prefetchDueCards, prefetchCardStats } from "@/src/features/cards/server/prefetch";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteNav } from "@/src/features/cards/ui/site_nav";
import { ReviewSession } from "@/src/features/cards/ui/review_session";
import { StatsDashboard } from "@/src/features/cards/ui/stats_dashboard";

const HomePage = async () => {
  await requireSession();
  await Promise.all([prefetchDueCards(), prefetchCardStats()]);

  return (
    <HydrateClient>
      <SiteNav />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsDashboard />
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <Suspense fallback={<Skeleton className="h-64 w-full max-w-md mx-auto" />}>
            <ReviewSession />
          </Suspense>
        </ErrorBoundary>
      </main>
    </HydrateClient>
  );
};

export default HomePage;