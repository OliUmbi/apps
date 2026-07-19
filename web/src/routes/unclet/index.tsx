import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unclet/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/unclet/"!</div>;
}
