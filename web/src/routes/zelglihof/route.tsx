import {createFileRoute, Link, Outlet} from "@tanstack/react-router";
import Navigation from "../../components/navigation/navigation";

export const Route = createFileRoute("/zelglihof")({
    component: RouteComponent,
});

const navigationLinks = [
	{
		label: "Aktuelles",
		to: "/zelglihof/latest",
	},
    {
        label: "Produkte",
        to: "/zelglihof/products",
    },
    {
        label: "Dienstleistungen",
        to: "/zelglihof/services",
    },
    {
        label: "Über uns",
        to: "/zelglihof/about",
    },
    {
        label: "Kontakt",
        to: "/zelglihof/contact",
    },
];

function RouteComponent() {
    return (
        <>
            <header className="flex gap-12 justify-between md:justify-center items-center md:p-8 p-4">
                <Link to="/zelglihof/">
					<span className="font-serif font-black text-3xl">Zelglihof</span>
				</Link>
                <Navigation links={navigationLinks}/>
            </header>
            <main className="p-8 h-full">
                <Outlet/>
            </main>
        </>
    );
}
