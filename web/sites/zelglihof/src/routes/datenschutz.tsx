import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../pages/legal-pages";
export const Route = createFileRoute("/datenschutz")({
	head: () => ({ meta: [{ title: "Datenschutz · Zelglihof" }] }),
	component: PrivacyPage,
});
