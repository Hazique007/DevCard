import { requireSession } from "@/lib/auth";
import { ApiKeyDialog } from "@/components/ui/api_key_dialog";
import { CardsList } from "@/src/features/cards/ui/cards_list";
import { SiteNav } from "@/src/features/cards/ui/site_nav";
import { FloatingChatButton } from "@/src/features/chat/ui/floating_chat_button";

const CardsPage = async () => {
  await requireSession();

  return (
    <>
      <SiteNav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex pb-6 items-center justify-between">
          <h1 className="text-2xl font-bold">All cards</h1>
          <ApiKeyDialog />
        </div>
        <CardsList />
        <FloatingChatButton />
      </main>
    </>
  );
};

export default CardsPage;