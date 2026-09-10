import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "../pages/contact-page";
export const Route = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: m.zelglihof_routes_contact_title() }] }),
	component: ContactPage,
});
