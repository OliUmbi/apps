import { attemptSchema, messageSchema } from "./schemas";

export type * from "./types";

import {
	createHttpClient,
	pagedSchema,
	type ServiceOptions,
} from "@oliumbi/http-client";
import { z } from "zod";

/** Delivery is queue-based. HTTP exposes history only; it cannot send or retry. */
export function createMessagingClient(options: Omit<ServiceOptions, "name">) {
	const http = createHttpClient({ ...options, name: "Messaging" });
	return {
		list: (page = 0, size = 30, status?: string) =>
			http.json(
				`/message?${new URLSearchParams({
					page: String(page),
					size: String(size),
					...(status ? { status } : {}),
				})}`,
				pagedSchema(messageSchema),
			),
		get: (id: string) =>
			http.json(
				`/message/${encodeURIComponent(id)}`,
				z.object({
					message: messageSchema,
					attempts: z.array(attemptSchema),
				}),
			),
	};
}
