import type { Transaction } from "@oliumbi/database";
import type { OutgoingMessage } from "@oliumbi/messaging";
import { database } from "../server/database.server";
import { insertOutgoingMessages } from "../server/outgoing-message.repository";
import type { ReservationInput } from "./reservation.schema";

export interface ReservableVariant {
	productName: string;
	variantName: string;
	stockQuantity: number;
	active: boolean;
}

interface VariantRow {
	product_name: string;
	variant_name: string;
	stock_quantity: number;
	active: boolean;
}

export async function insertReservationIfAvailable(
	id: string,
	input: ReservationInput,
	now: Date,
	createNotifications: (variant: ReservableVariant) => OutgoingMessage[],
): Promise<boolean> {
	return database.transaction(async (sql) => {
		const variant = await findAndLockVariant(sql, input);
		if (!variant?.active || variant.stockQuantity < input.quantity)
			return false;

		await decrementStock(sql, input.variantId, input.quantity, now);
		await insertReservation(sql, id, input, now);
		await insertOutgoingMessages(sql, createNotifications(variant));
		return true;
	});
}

async function findAndLockVariant(
	sql: Transaction,
	input: Pick<ReservationInput, "productId" | "variantId">,
): Promise<ReservableVariant | null> {
	const rows = await sql<VariantRow[]>`
		select p.name as product_name, v.name as variant_name,
		       v.stock_quantity, (p.active and v.active) as active
		from zelglihof.product p
		join zelglihof.product_variant v on v.product_id = p.id
		where p.id = ${input.productId} and v.id = ${input.variantId}
		for update of v
	`;
	const row = rows[0];
	return row
		? {
				productName: row.product_name,
				variantName: row.variant_name,
				stockQuantity: row.stock_quantity,
				active: row.active,
			}
		: null;
}

async function decrementStock(
	sql: Transaction,
	variantId: string,
	quantity: number,
	now: Date,
) {
	await sql`
		update zelglihof.product_variant
		set stock_quantity = stock_quantity - ${quantity}, updated_at = ${now}
		where id = ${variantId}
	`;
}

async function insertReservation(
	sql: Transaction,
	id: string,
	input: ReservationInput,
	now: Date,
) {
	await sql`
		insert into zelglihof.reservation (
			id, product_id, variant_id, customer_name, email, phone, quantity, note,
			status, created_at, updated_at
		) values (
			${id}, ${input.productId}, ${input.variantId}, ${input.name},
			${input.email || null}, ${input.phone || null}, ${input.quantity},
			${input.note || null}, 'new', ${now}, ${now}
		)
	`;
}
