import { createFileRoute } from "@tanstack/react-router";
import { UpdatesPage } from "../../pages/updates-page";
export const Route = createFileRoute("/aktuelles/")({
	head: () => ({
		meta: [
			{ title: "Aktuelles · Zelglihof Mägenwil" },
			{
				name: "description",
				content: "Neuigkeiten, Erntetermine und Angebote vom Zelglihof.",
			},
		],
	}),
	component: UpdatesPage,
});
