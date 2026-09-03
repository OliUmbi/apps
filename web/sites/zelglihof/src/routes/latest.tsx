import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/latest")({
	beforeLoad: () => {
		throw redirect({ to: "/aktuelles" });
	},
});
