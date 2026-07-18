import {createFileRoute, Outlet} from '@tanstack/react-router'
import {Menu} from "lucide-react";

export const Route = createFileRoute('/zelglihof')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <header className="flex gap-4 justify-between items-center p-4 bg-amber-50">
                <span className="font-serif font-black text-lg">Zelglihof</span>
                <button className="rounded-2xl px-4 py-3 bg-amber-300 flex items-center gap-2 text-sm font-bold">Menu <Menu size={24}/></button>
            </header>
            <main className="p-4 h-full">
                <Outlet/>
            </main>
        </>
    )
}
