import { z } from "zod";

export const passwordRequirements = {
	minimumCharacters: 10,
	maximumBytes: 72,
} as const;

export const passwordSchema = z
	.string()
	.refine(
		(value) =>
			Array.from(value).length >= passwordRequirements.minimumCharacters &&
			new TextEncoder().encode(value).length <=
				passwordRequirements.maximumBytes &&
			/\p{Lu}/u.test(value) &&
			/\p{Ll}/u.test(value) &&
			/\p{Nd}/u.test(value),
		"Use at least 10 characters, uppercase and lowercase letters, and a number; maximum 72 UTF-8 bytes",
	);
