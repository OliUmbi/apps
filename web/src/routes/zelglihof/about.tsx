import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/zelglihof/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/zelglihof/about"!</div>;
}
