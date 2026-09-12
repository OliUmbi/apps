import { z } from "zod";

export const limits = {
	name: 120,
	title: 240,
	text: 3_000,
	body: 100_000,
	email: 320,
	phone: 40,
	page: 30,
	maxPage: 100,
} as const;
export const idSchema = z.uuid();
export const nameSchema = z.string().trim().min(2).max(limits.name);
export const emailSchema = z.email().trim().toLowerCase().max(limits.email);
export const phoneSchema = z.string().trim().min(3).max(limits.phone);
export const optionalEmailSchema = z.union([z.literal(""), emailSchema]);
export const textSchema = z.string().trim().max(limits.text);
export const slugSchema = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	.max(limits.name);
export const statusValues = [
	"new",
	"in-progress",
	"completed",
	"cancelled",
] as const;
export const statusSchema = z.enum(statusValues);
export const pageSchema = z.object({
	page: z.number().int().nonnegative().default(0),
	size: z.number().int().min(1).max(limits.maxPage).default(limits.page),
	search: z.string().trim().max(limits.title).default(""),
});
export type PageInput = z.infer<typeof pageSchema>;
export interface Page<T> {
	items: T[];
	nextPage: number | null;
}
export function pageResult<T>(rows: T[], input: PageInput): Page<T> {
	return {
		items: rows.slice(0, input.size),
		nextPage: rows.length > input.size ? input.page + 1 : null,
	};
}
export const siteIds = ["jublawoma", "unclet", "zelglihof", "oliumbi"] as const;
export const siteSchema = z.enum(siteIds);
export type SiteId = z.infer<typeof siteSchema>;
