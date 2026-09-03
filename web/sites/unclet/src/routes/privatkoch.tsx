import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/privatkoch")({
	beforeLoad: () => {
		throw redirect({ to: "/angebot" });
	},
});
