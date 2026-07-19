import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navigation from "../../components/navigation/navigation";

export const Route = createFileRoute("/zelglihof")({
	component: RouteComponent,
});

const navigationLinks = [
	{
		label: "Zelglihof",
		to: "/",
	},
	{
		label: "Produkte",
		to: "/products",
	},
	{
		label: "Über uns",
		to: "/about",
	},
];

function RouteComponent() {
	return (
		<>
			<header className="flex gap-4 justify-between items-center p-4 bg-amber-50">
				<span className="font-serif font-black text-lg">Zelglihof</span>
				<Navigation links={navigationLinks} />
			</header>
			<main className="p-4 h-full">
				<Outlet />
			</main>
		</>
	);
}
