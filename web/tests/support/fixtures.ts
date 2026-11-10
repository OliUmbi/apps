import { randomUUID } from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import type { Transaction } from "../../packages/database/src";
import {
	donation,
	donationItem,
} from "../../packages/jublawoma-data/src/schema";
import { message as queuedMessage } from "../../packages/queue/src/schema";
import {
	product,
	productVariant,
	subscriber,
} from "../../packages/zelglihof-data/src/schema";

export const id = () => randomUUID();
export const uniqueEmail = (prefix = "review") =>
	`${prefix}-${randomUUID()}@example.com`;

const now = () => new Date();
const iso = (date: Date) => date.toISOString();

export interface DonationSeed {
	donationId: string;
	itemId: string;
}

/** A running donation with one item; `quantity` is the item's total capacity. */
export async function seedDonation(
	transaction: Transaction,
	options: {
		quantity: string;
		step?: string;
		startsAt?: Date;
		endsAt?: Date;
		title?: string;
	} = { quantity: "10" },
): Promise<DonationSeed> {
	const donationId = id();
	const itemId = id();
	const startsAt = options.startsAt ?? new Date(now().getTime() - 3_600_000);
	const endsAt = options.endsAt ?? new Date(now().getTime() + 3_600_000);
	await transaction.insert(donation).values({
		id: donationId,
		title: options.title ?? "Review donation",
		description: "Review description",
		contact: "Review contact",
		startsAt: iso(startsAt),
		endsAt: iso(endsAt),
		createdAt: iso(now()),
		updatedAt: iso(now()),
	});
	await transaction.insert(donationItem).values({
		id: itemId,
		donationId,
		name: "Review item",
		quantity: options.quantity,
		step: options.step ?? "0.1",
		unit: "kg",
		createdAt: iso(now()),
		updatedAt: iso(now()),
	});
	return { donationId, itemId };
}

export interface ProductSeed {
	productId: string;
	variantId: string;
	variantName: string;
}

/**
 * A visible, reservable product with one variant. `quantity: null` is an
 * untracked variant; a window is only applied when the caller passes one.
 */
export async function seedProduct(
	transaction: Transaction,
	options: {
		quantity: number | null;
		visible?: boolean;
		reservable?: boolean;
		startsAt?: Date | null;
		endsAt?: Date | null;
		archived?: boolean;
	} = { quantity: 5 },
): Promise<ProductSeed> {
	const productId = id();
	const variantId = id();
	await transaction.insert(product).values({
		id: productId,
		name: "Review product",
		description: "Review description",
		body: "Review body",
		visible: options.visible ?? true,
		reservable: options.reservable ?? true,
		startsAt: options.startsAt ? iso(options.startsAt) : null,
		endsAt: options.endsAt ? iso(options.endsAt) : null,
		archivedAt: options.archived ? iso(now()) : null,
		createdAt: iso(now()),
		updatedAt: iso(now()),
	});
	await transaction.insert(productVariant).values({
		id: variantId,
		productId,
		name: "Review variant",
		description: null,
		price: "CHF 5",
		quantity: options.quantity,
		archivedAt: options.archived ? iso(now()) : null,
		createdAt: iso(now()),
		updatedAt: iso(now()),
	});
	return { productId, variantId, variantName: "Review variant" };
}

export interface SubscriberSeed {
	subscriberId: string;
	email: string;
	unsubscribeToken: string;
	confirmationTokenHash: string;
}

export async function seedSubscriber(
	transaction: Transaction,
	options: {
		status: "pending" | "active" | "unsubscribed";
		email?: string;
		requestedAt?: Date;
	} = { status: "pending" },
): Promise<SubscriberSeed> {
	const subscriberId = id();
	const email = options.email ?? uniqueEmail();
	const unsubscribeToken = randomUUID();
	const confirmationTokenHash = randomUUID();
	await transaction.insert(subscriber).values({
		id: subscriberId,
		email,
		status: options.status,
		requestedAt: iso(options.requestedAt ?? now()),
		confirmationTokenHash,
		unsubscribeToken,
		createdAt: iso(now()),
		updatedAt: iso(now()),
	});
	return { subscriberId, email, unsubscribeToken, confirmationTokenHash };
}

export async function seedCampaign(
	transaction: Transaction,
	options: { status?: "draft" | "queued" | "sent"; subject?: string } = {},
): Promise<{ campaignId: string }> {
	const campaignId = id();
	await transaction.execute(sql`
		INSERT INTO zelglihof.campaign (id, subject, body, status, created_at, updated_at)
		VALUES (${campaignId}, ${options.subject ?? "Review subject"}, 'Review body', ${options.status ?? "draft"}, now(), now())`);
	return { campaignId };
}

/** Number of queued emails addressed to `recipient` (or all, when omitted). */
export async function queuedEmails(
	transaction: Transaction,
	recipient?: string,
): Promise<number> {
	const [row] = await transaction
		.select({ value: count() })
		.from(queuedMessage)
		.where(recipient ? eq(queuedMessage.recipient, recipient) : undefined);
	return Number(row?.value ?? 0);
}

/** The variant's current stock after a write. */
export async function variantQuantity(
	transaction: Transaction,
	variantId: string,
): Promise<number | null> {
	const [row] = await transaction
		.select({ quantity: productVariant.quantity })
		.from(productVariant)
		.where(eq(productVariant.id, variantId));
	return row?.quantity ?? null;
}
