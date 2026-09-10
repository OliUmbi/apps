import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ImprintPage } from "../pages/legal-pages";
export const Route = createFileRoute("/legal")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_legal_title() }] }),
	component: ImprintPage,
});
