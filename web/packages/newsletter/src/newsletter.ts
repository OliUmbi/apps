import { createHash, randomBytes } from "node:crypto";
import type postgres from "postgres";

type Database = ReturnType<typeof postgres>;
type Queryable = postgres.TransactionSql;

export type NewsletterStatus = "pending" | "active" | "unsubscribed";

export interface Subscriber {
	id: string;
	email: string;
	locale: "de-CH" | "en";
	status: NewsletterStatus;
	consentSource: string;
	requestedAt: Date;
	confirmedAt: Date | null;
	unsubscribedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

interface SubscriberRow {
	id: string;
	email: string;
	locale: "de-CH" | "en";
	status: NewsletterStatus;
	consent_source: string;
	requested_at: Date;
	confirmed_at: Date | null;
	unsubscribed_at: Date | null;
	last_confirmation_requested_at: Date | null;
	confirmation_expires_at: Date | null;
	unsubscribe_token: string;
	created_at: Date;
	updated_at: Date;
}

export type ConfirmationResult = {
	outcome: "confirmed" | "already-confirmed" | "expired" | "invalid";
};
export type UnsubscribeResult = {
	outcome: "unsubscribed" | "already-unsubscribed" | "invalid";
};

const resendDelayMs = 5 * 60 * 1000;

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function newToken(): string {
	return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
	return createHash("sha256").update(token, "utf8").digest("hex");
}

function tokenUrl(baseUrl: string, path: string, token: string): string {
	return new URL(`${path}/${encodeURIComponent(token)}`, baseUrl).toString();
}

function fromRow(row: SubscriberRow): Subscriber {
	return {
		id: row.id,
		email: row.email,
		locale: row.locale,
		status: row.status,
		consentSource: row.consent_source,
		requestedAt: row.requested_at,
		confirmedAt: row.confirmed_at,
		unsubscribedAt: row.unsubscribed_at,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

async function lockEmail(
	sql: Queryable,
	normalizedEmail: string,
): Promise<void> {
	await sql`select pg_advisory_xact_lock(hashtextextended(${normalizedEmail}, 0))`;
}

async function enqueue(
	sql: Queryable,
	values: {
		type: string;
		recipient: string;
		locale: "de-CH" | "en";
		payload: Record<string, string>;
		correlationKey: string;
	},
): Promise<void> {
	await sql`
    insert into messaging.outbox (message_type, recipient_email, locale, payload, correlation_key)
    values (
      ${values.type}, ${values.recipient}, ${values.locale},
      ${sql.json(values.payload)}, ${values.correlationKey}
    )
  `;
}

async function queueConfirmation(
	sql: Queryable,
	subscriber: Pick<SubscriberRow, "id" | "email" | "locale">,
	token: string,
	publicBaseUrl: string,
): Promise<void> {
	await enqueue(sql, {
		type: "newsletter.confirmation",
		recipient: subscriber.email,
		locale: subscriber.locale,
		payload: {
			confirmUrl: tokenUrl(publicBaseUrl, "/newsletter/bestaetigen", token),
		},
		correlationKey: `newsletter-subscriber:${subscriber.id}`,
	});
}

export async function requestSubscription(
	database: Database,
	input: {
		email: string;
		locale: "de-CH" | "en";
		consentSource: string;
		publicBaseUrl: string;
	},
): Promise<{ outcome: "accepted" }> {
	const email = input.email.trim();
	const normalizedEmail = normalizeEmail(email);

	await database.begin(async (sql) => {
		await lockEmail(sql, normalizedEmail);
		const existingRows = await sql<SubscriberRow[]>`
      select * from zelglihof.newsletter_subscriber
      where email_normalized = ${normalizedEmail}
      for update
    `;
		const existing = existingRows[0];

		if (existing?.status === "active") return;
		if (
			existing?.status === "pending" &&
			existing.last_confirmation_requested_at &&
			Date.now() - existing.last_confirmation_requested_at.getTime() <
				resendDelayMs
		)
			return;

		const token = newToken();
		const tokenHash = hashToken(token);
		let subscriber: SubscriberRow;

		if (existing) {
			const rows = await sql<SubscriberRow[]>`
        update zelglihof.newsletter_subscriber
        set email = ${email}, locale = ${input.locale}, status = 'pending',
            consent_source = ${input.consentSource}, consent_text_version = 'newsletter-v1', requested_at = now(),
            confirmed_at = null, unsubscribed_at = null,
            confirmation_token_hash = ${tokenHash},
            confirmation_expires_at = now() + interval '48 hours',
            last_confirmation_requested_at = now(), updated_at = now()
        where id = ${existing.id}
        returning *
      `;
			subscriber = rows[0];
		} else {
			const rows = await sql<SubscriberRow[]>`
        insert into zelglihof.newsletter_subscriber (
          email, email_normalized, locale, consent_source, consent_text_version,
          confirmation_token_hash, confirmation_expires_at,
          last_confirmation_requested_at, unsubscribe_token
        ) values (
          ${email}, ${normalizedEmail}, ${input.locale}, ${input.consentSource}, 'newsletter-v1',
          ${tokenHash}, now() + interval '48 hours', now(), ${newToken()}
        )
        returning *
      `;
			subscriber = rows[0];
		}

		await queueConfirmation(sql, subscriber, token, input.publicBaseUrl);
	});

	return { outcome: "accepted" };
}

export async function confirmSubscription(
	database: Database,
	token: string,
	publicBaseUrl: string,
): Promise<ConfirmationResult> {
	return database.begin(async (sql) => {
		const rows = await sql<SubscriberRow[]>`
      select * from zelglihof.newsletter_subscriber
      where confirmation_token_hash = ${hashToken(token)}
      for update
    `;
		const subscriber = rows[0];
		if (!subscriber) return { outcome: "invalid" };
		if (subscriber.status === "active") return { outcome: "already-confirmed" };
		if (
			!subscriber.confirmation_expires_at ||
			subscriber.confirmation_expires_at.getTime() < Date.now()
		) {
			return { outcome: "expired" };
		}

		await sql`
      update zelglihof.newsletter_subscriber
      set status = 'active', confirmed_at = now(), unsubscribed_at = null,
          confirmation_expires_at = null, updated_at = now()
      where id = ${subscriber.id}
    `;
		await enqueue(sql, {
			type: "newsletter.welcome",
			recipient: subscriber.email,
			locale: subscriber.locale,
			payload: {
				unsubscribeUrl: tokenUrl(
					publicBaseUrl,
					"/newsletter/abmelden",
					subscriber.unsubscribe_token,
				),
				oneClickUnsubscribeUrl: tokenUrl(
					publicBaseUrl,
					"/api/newsletter/abmelden",
					subscriber.unsubscribe_token,
				),
			},
			correlationKey: `newsletter-subscriber:${subscriber.id}`,
		});
		return { outcome: "confirmed" };
	});
}

export async function unsubscribeByToken(
	database: Database,
	token: string,
): Promise<UnsubscribeResult> {
	return database.begin(async (sql) => {
		const rows = await sql<SubscriberRow[]>`
      select * from zelglihof.newsletter_subscriber
      where unsubscribe_token = ${token}
      for update
    `;
		const subscriber = rows[0];
		if (!subscriber) return { outcome: "invalid" };
		if (subscriber.status === "unsubscribed")
			return { outcome: "already-unsubscribed" };

		await sql`
      update zelglihof.newsletter_subscriber
      set status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
      where id = ${subscriber.id}
    `;
		return { outcome: "unsubscribed" };
	});
}

export async function listSubscribers(
	database: Database,
	filters: { search?: string; status?: NewsletterStatus; limit?: number } = {},
): Promise<Subscriber[]> {
	const search = filters.search?.trim() ?? "";
	const status = filters.status ?? null;
	const limit = Math.min(Math.max(filters.limit ?? 100, 1), 250);
	const rows = await database<SubscriberRow[]>`
    select * from zelglihof.newsletter_subscriber
    where (${search} = '' or email ilike ${`%${search}%`})
      and (${status}::text is null or status = ${status})
    order by created_at desc
    limit ${limit}
  `;
	return rows.map(fromRow);
}

export async function unsubscribeSubscriber(
	database: Database,
	id: string,
): Promise<void> {
	await database`
    update zelglihof.newsletter_subscriber
    set status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
    where id = ${id}
  `;
}

export async function resendConfirmation(
	database: Database,
	id: string,
	publicBaseUrl: string,
): Promise<void> {
	await database.begin(async (sql) => {
		const rows = await sql<SubscriberRow[]>`
      select * from zelglihof.newsletter_subscriber where id = ${id} for update
    `;
		const subscriber = rows[0];
		if (subscriber?.status !== "pending") {
			throw new Error(
				"Only pending subscriptions can receive another confirmation",
			);
		}
		const token = newToken();
		await sql`
      update zelglihof.newsletter_subscriber
      set confirmation_token_hash = ${hashToken(token)},
          confirmation_expires_at = now() + interval '48 hours',
          last_confirmation_requested_at = now(), updated_at = now()
      where id = ${id}
    `;
		await queueConfirmation(sql, subscriber, token, publicBaseUrl);
	});
}

export async function correctSubscriberEmail(
	database: Database,
	id: string,
	newEmail: string,
	publicBaseUrl: string,
): Promise<void> {
	const email = newEmail.trim();
	const normalizedEmail = normalizeEmail(email);
	await database.begin(async (sql) => {
		await lockEmail(sql, normalizedEmail);
		const token = newToken();
		const rows = await sql<SubscriberRow[]>`
      update zelglihof.newsletter_subscriber
      set email = ${email}, email_normalized = ${normalizedEmail}, status = 'pending',
          consent_source = 'studio-correction', consent_text_version = 'newsletter-v1', requested_at = now(),
          confirmed_at = null, unsubscribed_at = null,
          confirmation_token_hash = ${hashToken(token)},
          confirmation_expires_at = now() + interval '48 hours',
          last_confirmation_requested_at = now(), updated_at = now()
      where id = ${id}
      returning *
    `;
		const subscriber = rows[0];
		if (!subscriber) throw new Error("Subscriber not found");
		await queueConfirmation(sql, subscriber, token, publicBaseUrl);
	});
}

export async function deleteSubscriber(
	database: Database,
	id: string,
): Promise<void> {
	await database`delete from zelglihof.newsletter_subscriber where id = ${id}`;
}
