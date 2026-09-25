import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ImprintPage } from "../components/legal-content";

export const Route = createFileRoute("/legal")({
	head: () => ({ meta: [{ title: m.zelglihof_legal_page_title() }] }),
	component: ImprintPage,
});
