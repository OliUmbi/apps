import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { desc, eq, ilike } from "drizzle-orm";
import { subscriber } from "../schema";
import type { SubscriberKey } from "./subscriber";

const subscriberSelection = {
	id: subscriber.id,
	email: subscriber.email,
	status: subscriber.status,
	requestedAt: subscriber.requestedAt,
	confirmedAt: subscriber.confirmedAt,
	unsubscribedAt: subscriber.unsubscribedAt,
	createdAt: subscriber.createdAt,
	updatedAt: subscriber.updatedAt,
};

export function createSubscriberRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
				db
					.select(subscriberSelection)
					.from(subscriber)
					.where(
						input.search
							? ilike(subscriber.email, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(subscriber.createdAt), subscriber.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: SubscriberKey) {
			const [record] = await db
				.select(subscriberSelection)
				.from(subscriber)
				.where(eq(subscriber.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async delete(key: SubscriberKey): Promise<void> {
			await db.delete(subscriber).where(eq(subscriber.id, key.id));
		},
	};
}
