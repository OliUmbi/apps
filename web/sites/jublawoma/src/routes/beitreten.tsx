import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/beitreten")({
	beforeLoad: () => {
		throw redirect({ to: "/mitmachen", replace: true });
	},
});
