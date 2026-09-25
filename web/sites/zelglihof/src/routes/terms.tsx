import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "../components/legal-content";

export const Route = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: m.zelglihof_terms_page_title() }] }),
	component: TermsPage,
});
