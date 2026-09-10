import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../pages/services-page";
export const Route = createFileRoute("/services")({
	head: () => ({
		meta: [{ title: m.zelglihof_routes_services_title() }],
	}),
	component: ServicesPage,
});
