import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navigation from "../../components/navigation/navigation";

export const Route = createFileRoute("/zelglihof")({
	component: RouteComponent,
});

const navigationLinks = [
	{
		label: "Zelglihof",
		to: "/zelglihof/",
	},
	{
		label: "Produkte",
		to: "/zelglihof/products",
	},
	{
		label: "Über uns",
		to: "/zelglihof/about",
	},
];

function RouteComponent() {
	return (
		<>
			<header className="flex gap-8 justify-between md:justify-center items-center p-4 bg-amber-50">
				<span className="font-serif font-black text-3xl">Zelglihof</span>
				<Navigation links={navigationLinks} />
			</header>
			<main className="p-4 h-full">
				<Outlet />
			</main>
		</>
	);
}
