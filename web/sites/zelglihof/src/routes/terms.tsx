import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "../pages/legal-pages";
export const Route = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_terms_title() }] }),
	component: TermsPage,
});
