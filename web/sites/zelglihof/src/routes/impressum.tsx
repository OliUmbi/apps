import { createFileRoute } from "@tanstack/react-router";
import { ImprintPage } from "../pages/legal-pages";
export const Route = createFileRoute("/impressum")({
	head: () => ({ meta: [{ title: "Impressum · Zelglihof" }] }),
	component: ImprintPage,
});
