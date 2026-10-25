import { idSchema, titleSchema } from "@oliumbi/contracts";
import { z } from "zod";

export const memberKeySchema = z.strictObject({
	id: idSchema,
});
export type MemberKey = z.infer<typeof memberKeySchema>;

// The managed member record as it crosses the package boundary. Written out on
// purpose: a renamed storage column must not silently change this shape.
export interface Member {
	id: string;
	name: string;
	leadership: boolean;
	imageId: string | null;
	groupName: string;
	createdAt: string;
	updatedAt: string;
}

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
