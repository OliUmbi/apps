import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { FarmOverview } from "../components/farm-overview";

export const Route = createFileRoute("/about")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_about_title() }] }),
	component: FarmOverview,
});
