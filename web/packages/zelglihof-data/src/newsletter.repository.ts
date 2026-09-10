import type { Transaction } from "@oliumbi/database";
import type { Subscriber } from "./newsletter.types";

export function newsletterRepository(sql: Transaction) {
	return {
		async byId(id: string) {
			const [subscriber] = await sql<Subscriber[]>`
				SELECT * FROM zelglihof.subscriber
				WHERE id = ${id}
				FOR UPDATE
			`;
			return subscriber;
		},
		async correctEmail(id: string, email: string, hash: string, now: Date) {
			await sql`
				UPDATE zelglihof.subscriber
				SET email = ${email},
					status = 'pending',
					confirmation_token_hash = ${hash},
					requested_at = ${now},
					confirmed_at = NULL,
					unsubscribed_at = NULL,
					updated_at = ${now}
				WHERE id = ${id}
			`;
		},
		async lockEmail(email: string) {
			await sql`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`;
		},
		async byEmail(email: string) {
			const [subscriber] = await sql<Subscriber[]>`
				SELECT * FROM zelglihof.subscriber
				WHERE email = ${email}
				FOR UPDATE
			`;
			return subscriber;
		},
		async byConfirmation(hash: string) {
			const [subscriber] = await sql<Subscriber[]>`
				SELECT * FROM zelglihof.subscriber
				WHERE confirmation_token_hash = ${hash}
				FOR UPDATE
			`;
			return subscriber;
		},
		async byUnsubscribe(token: string) {
			const [subscriber] = await sql<Subscriber[]>`
				SELECT * FROM zelglihof.subscriber
				WHERE unsubscribe_token = ${token}
				FOR UPDATE
			`;
			return subscriber;
		},
		async request(
			email: string,
			hash: string,
			unsubscribeToken: string,
			now: Date,
		) {
			const [subscriber] = await sql<Subscriber[]>`
				INSERT INTO zelglihof.subscriber (
					email, status, requested_at, confirmation_token_hash,
					unsubscribe_token, created_at, updated_at
				)
				VALUES (
					${email}, 'pending', ${now}, ${hash}, ${unsubscribeToken}, ${now}, ${now}
				)
				ON CONFLICT (email) DO UPDATE
				SET status = 'pending',
					requested_at = ${now},
					confirmed_at = NULL,
					unsubscribed_at = NULL,
					confirmation_token_hash = ${hash},
					updated_at = ${now}
				RETURNING *
			`;
			return subscriber;
		},
		async confirm(id: string, now: Date) {
			await sql`
				UPDATE zelglihof.subscriber
				SET status = 'active', confirmed_at = ${now},
					unsubscribed_at = NULL, updated_at = ${now}
				WHERE id = ${id}
			`;
		},
		async unsubscribe(id: string, now: Date) {
			await sql`
				UPDATE zelglihof.subscriber
				SET status = 'unsubscribed', unsubscribed_at = ${now}, updated_at = ${now}
				WHERE id = ${id}
			`;
		},
	};
}
