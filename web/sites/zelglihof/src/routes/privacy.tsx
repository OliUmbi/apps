import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../pages/legal-pages";
export const Route = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_privacy_title() }] }),
	component: PrivacyPage,
});
