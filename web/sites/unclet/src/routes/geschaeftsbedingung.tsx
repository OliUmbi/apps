import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/geschaeftsbedingung")({
	beforeLoad: () => {
		throw redirect({ to: "/agb" });
	},
});
