import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/products/$productId")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/hofladen/$productId", params });
	},
});
