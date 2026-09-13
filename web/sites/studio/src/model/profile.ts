import { emailSchema, nameSchema } from "@oliumbi/contracts";
import { passwordSchema } from "@oliumbi/identity/password";
import { z } from "zod";

export const profileSchema = z.object({ name: nameSchema, email: emailSchema });

export const profilePasswordSchema = z
	.object({ password: passwordSchema, confirmation: z.string() })
	.refine((value) => value.password === value.confirmation, {
		message: "Passwords do not match",
		path: ["confirmation"],
	});
