import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "../pages/legal-pages";
export const Route = createFileRoute("/agb")({
	head: () => ({ meta: [{ title: "AGB · Zelglihof" }] }),
	component: TermsPage,
});
