import { createResourceRepository } from "@oliumbi/unclet-data";
import { database } from "../server/database.server";
import type { ReviewInput } from "./review.schema";

export async function saveReview(input: ReviewInput) {
	await createResourceRepository(database.sql, "unclet.review").create({
		...input,
		visible: false,
	});
	return { outcome: "accepted" as const };
}
