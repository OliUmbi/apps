import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ContactDetails } from "../components/contact-details";

export const Route = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: m.zelglihof_contact_page_title() }] }),
	component: ContactDetails,
});
