import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/kurse")({
	beforeLoad: () => {
		throw redirect({ to: "/angebot" });
	},
});
