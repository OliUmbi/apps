import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../pages/services-page";
export const Route = createFileRoute("/dienstleistungen")({
	head: () => ({
		meta: [{ title: "Dienstleistungen · Zelglihof Mägenwil" }],
	}),
	component: ServicesPage,
});
