import type { Transaction } from "@oliumbi/database";
import { eq, sql } from "drizzle-orm";
import { subscriber } from "./schema";

export function createNewsletterRepository(transaction: Transaction) {
	return {
		async byId(id: string) {
			const [record] = await transaction
				.select()
				.from(subscriber)
				.where(eq(subscriber.id, id))
				.for("update");
			return record;
		},
		async byEmail(email: string) {
			const [record] = await transaction
				.select()
				.from(subscriber)
				.where(eq(subscriber.email, email))
				.for("update");
			return record;
		},
		async byConfirmation(hash: string) {
			const [record] = await transaction
				.select()
				.from(subscriber)
				.where(eq(subscriber.confirmationTokenHash, hash))
				.for("update");
			return record;
		},
		async byUnsubscribe(token: string) {
			const [record] = await transaction
				.select()
				.from(subscriber)
				.where(eq(subscriber.unsubscribeToken, token))
				.for("update");
			return record;
		},
		async lockEmail(email: string) {
			await transaction.execute(
				sql`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`,
			);
		},
		async correctEmail(id: string, email: string, hash: string, now: Date) {
			await transaction
				.update(subscriber)
				.set({
					email,
					status: "pending",
					confirmationTokenHash: hash,
					requestedAt: now.toISOString(),
					confirmedAt: null,
					unsubscribedAt: null,
					updatedAt: now.toISOString(),
				})
				.where(eq(subscriber.id, id));
		},
		async request(
			email: string,
			hash: string,
			unsubscribeToken: string,
			now: Date,
		) {
			const [record] = await transaction
				.insert(subscriber)
				.values({
					email,
					status: "pending",
					requestedAt: now.toISOString(),
					confirmationTokenHash: hash,
					unsubscribeToken,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				})
				.onConflictDoUpdate({
					target: subscriber.email,
					set: {
						status: "pending",
						requestedAt: now.toISOString(),
						confirmedAt: null,
						unsubscribedAt: null,
						confirmationTokenHash: hash,
						updatedAt: now.toISOString(),
					},
				})
				.returning();
			return record;
		},
		async confirm(id: string, now: Date) {
			await transaction
				.update(subscriber)
				.set({
					status: "active",
					confirmedAt: now.toISOString(),
					unsubscribedAt: null,
					updatedAt: now.toISOString(),
				})
				.where(eq(subscriber.id, id));
		},
		async unsubscribe(id: string, now: Date) {
			await transaction
				.update(subscriber)
				.set({
					status: "unsubscribed",
					unsubscribedAt: now.toISOString(),
					updatedAt: now.toISOString(),
				})
				.where(eq(subscriber.id, id));
		},
	};
}
