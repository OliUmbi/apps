import {
	idSchema,
	nameSchema,
	phoneSchema,
	textSchema,
} from "@oliumbi/contracts";
import { z } from "zod";
export const commitmentSchema = z.object({
	donationId: idSchema,
	itemId: idSchema,
	name: nameSchema,
	phone: phoneSchema,
	quantity: z.number().positive(),
	note: textSchema,
});
export type CommitmentInput = z.infer<typeof commitmentSchema>;
