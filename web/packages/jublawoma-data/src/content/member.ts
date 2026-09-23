import { idSchema } from "@oliumbi/contracts";
import { titleSchema } from "@oliumbi/contracts/content-validation";
import { z } from "zod";
import type { member } from "../schema";

export const memberKeySchema = z.strictObject({
	id: idSchema,
});
export type MemberKey = z.infer<typeof memberKeySchema>;

export type Member = typeof member.$inferSelect;

export const memberInputSchema = z.strictObject({
	name: titleSchema,
	imageId: idSchema.nullable(),
	groupName: titleSchema,
	leadership: z.boolean(),
});
export type MemberInput = z.infer<typeof memberInputSchema>;

export function newMemberInput(): MemberInput {
	return {
		name: "",
		imageId: null,
		groupName: "",
		leadership: false,
	};
}

export function memberInputFromRecord(record: Member): MemberInput {
	return {
		name: record.name,
		imageId: record.imageId,
		groupName: record.groupName,
		leadership: record.leadership,
	};
}
