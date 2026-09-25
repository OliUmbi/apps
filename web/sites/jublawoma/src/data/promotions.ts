import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { createServerFn } from "@tanstack/react-start";
import type { PublicPromotion } from "../model/content";
import { database } from "../server/database.server";
import { imageFromId } from "./images";

export const getPromotions = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicPromotion[]> => {
		const page = await createPublicRepository(database.db).listPromotions(0);
		return page.items.map((record) => ({
			id: record.id,
			title: record.title,
			description: record.description ?? "",
			link: record.link,
			image: record.imageId ? imageFromId(record.imageId, record.title) : null,
		}));
	},
);
