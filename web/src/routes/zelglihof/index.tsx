import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/zelglihof/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-5xl w-full bg-green-200 p-8 h-120 m-2 rounded-3xl border border-green-300 shadow-lg shadow-green-300/50">
				<h1 className="text-2xl font-semibold">Zelglihof</h1>
				<h2 className="text-md font-semibold">Dein Hof in Mägenwil</h2>
			</div>
		</div>
	);
}
