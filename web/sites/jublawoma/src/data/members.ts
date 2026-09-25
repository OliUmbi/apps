import { pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { Member } from "@oliumbi/jublawoma-data/content/member";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PublicMember } from "../model/content";
import { database } from "../server/database.server";
import { imageFromId } from "./images";

function memberFromRecord(record: Member): PublicMember {
	return {
		id: record.id,
		name: record.name,
		groupName: record.groupName,
		leadership: record.leadership,
		image: record.imageId ? imageFromId(record.imageId, record.name) : null,
	};
}

export const getLeadership = createServerFn({ method: "GET" }).handler(
	async () => {
		const members = await createPublicRepository(database.db).leadership();
		return members.map(memberFromRecord);
	},
);
export const getMemberPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listMembers(
			data.page,
		);
		return { ...page, items: page.items.map(memberFromRecord) };
	});
