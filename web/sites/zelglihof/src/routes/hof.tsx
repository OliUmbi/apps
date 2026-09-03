import { createFileRoute } from "@tanstack/react-router";
import { FarmPage } from "../pages/farm-page";
export const Route = createFileRoute("/hof")({
	head: () => ({ meta: [{ title: "Unser Hof · Zelglihof Mägenwil" }] }),
	component: FarmPage,
});
