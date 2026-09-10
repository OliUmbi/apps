import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "../pages/farm-page";
export const Route = createFileRoute("/about")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_about_title() }] }),
	component: FarmPage,
});
