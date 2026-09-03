import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/catering")({
	beforeLoad: () => {
		throw redirect({ to: "/angebot" });
	},
});
