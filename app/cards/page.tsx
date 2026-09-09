import { CardsList } from "@/src/features/cards/ui/cards_list"
import { SiteNav } from "@/src/features/cards/ui/site_nav"


const CardsPage =()=>{
    return(
        <>
        <SiteNav />
         <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">All cards</h1>
        <CardsList />
      </main>
        </>
    )
}

export default CardsPage;