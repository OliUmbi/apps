import { createPublicRepository } from "@oliumbi/jublawoma-data";
import type { Member } from "@oliumbi/jublawoma-data/content/member";
import { createServerFn } from "@tanstack/react-start";
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
// The roster stays one bounded query: About needs the total for its collapsed
// list and a club has tens of members, so paging would only add complexity.
export const getMembers = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicMember[]> => {
		const members = await createPublicRepository(database.db).members();
		return members.map(memberFromRecord);
	},
);
