import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/veranstaltungen")({
	beforeLoad: () => {
		throw redirect({ to: "/anlaesse", replace: true });
	},
});
