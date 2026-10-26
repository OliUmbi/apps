import { createPublicRepository } from "@oliumbi/zelglihof-data";
import { createServerFn } from "@tanstack/react-start";
import type { PublicPromotion } from "../model/content";
import { database } from "../server/database.server";

// The home page shows a short promotion strip; it never needs a full page.
const promotionsFeedSize = 3;

export const getPromotions = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicPromotion[]> => {
		const page = await createPublicRepository(database.db).listPromotions(
			0,
			promotionsFeedSize,
		);
		return page.items.map((record) => ({
			id: record.id,
			title: record.title,
			description: record.description ?? "",
			link: record.link,
		}));
	},
);
