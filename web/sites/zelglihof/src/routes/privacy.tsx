import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../components/legal-content";

export const Route = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: m.zelglihof_privacy_page_title() }] }),
	component: PrivacyPage,
});
