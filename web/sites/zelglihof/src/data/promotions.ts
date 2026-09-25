import { createPublicRepository } from "@oliumbi/zelglihof-data";
import { createServerFn } from "@tanstack/react-start";
import type { PublicPromotion } from "../model/content";
import { database } from "../server/database.server";

export const getPromotions = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicPromotion[]> => {
		const page = await createPublicRepository(database.db).listPromotions(0);
		return page.items.map((record) => ({
			id: record.id,
			title: record.title,
			description: record.description ?? "",
			link: record.link,
		}));
	},
);
