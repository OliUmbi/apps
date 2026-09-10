import type { Page } from "@oliumbi/contracts";
import { z } from "zod";
export function pagedSchema<T>(item: z.ZodType<T>) {
	return z
		.object({
			content: z.array(item),
			page: z.object({
				number: z.number().int(),
				size: z.number().int(),
				totalPages: z.number().int(),
				totalElements: z.number().int(),
			}),
		})
		.transform(
			(result): Page<T> => ({
				items: result.content,
				nextPage:
					result.page.number + 1 < result.page.totalPages
						? result.page.number + 1
						: null,
			}),
		);
}
