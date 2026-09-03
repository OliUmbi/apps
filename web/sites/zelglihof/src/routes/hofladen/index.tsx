import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "../../pages/shop-page";
export const Route = createFileRoute("/hofladen/")({
	head: () => ({
		meta: [
			{ title: "Hofladen · Zelglihof Mägenwil" },
			{
				name: "description",
				content:
					"Mägenwiler Beef, frische Eier und saisonale Produkte direkt ab Hof.",
			},
		],
	}),
	component: ShopPage,
});
