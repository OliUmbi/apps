import { emailSchema, idSchema, nameSchema } from "@oliumbi/contracts";
import { passwordSchema } from "@oliumbi/identity/password";
import { z } from "zod";

export { passwordSchema } from "@oliumbi/identity/password";
export const accountSchema = z.object({ name: nameSchema, email: emailSchema });
export const newAccountSchema = accountSchema.extend({
	password: passwordSchema,
});
export const updateAccountSchema = accountSchema.extend({
	id: idSchema,
	enabled: z.boolean(),
});
export const permissionSchema = z.enum([
	"studio.admin",
	"jublawoma.manage",
	"unclet.manage",
	"zelglihof.manage",
	"oliumbi.manage",
]);
