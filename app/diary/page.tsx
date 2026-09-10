import { requireSession } from "@/lib/auth";
import { SiteNav } from "@/src/features/cards/ui/site_nav";
import { CreateNoteDialog } from "@/src/features/notes/ui/create_note_dialog";
import { NotesList } from "@/src/features/notes/ui/notes_list";

const DiaryPage = async () => {
  await requireSession();

  return (
    <>
      <SiteNav />
      <main className="max-w-7xl mx-auto px-6 py-10 pb-[calc(3.5rem+env(safe-area-inset-bottom)+1.5rem)] sm:pb-10 space-y-8">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold">Diary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Why you built things the way you built them.
            </p>
          </div>
          <CreateNoteDialog />
        </div>
        <NotesList />
      </main>
    </>
  );
};

export default DiaryPage;