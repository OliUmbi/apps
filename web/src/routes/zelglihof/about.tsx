import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/zelglihof/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<p>Wer</p>
			<p>Wo</p>
			<p>Tiere</p>
			<p>Pflanzen</p>
		</div>
	);
}
