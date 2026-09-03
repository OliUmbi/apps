import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/kontakt")({
	beforeLoad: () => {
		throw redirect({ to: "/mitmachen", replace: true });
	},
});
