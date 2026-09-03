import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "../pages/contact-page";
export const Route = createFileRoute("/kontakt")({
	head: () => ({ meta: [{ title: "Kontakt · Zelglihof Mägenwil" }] }),
	component: ContactPage,
});
