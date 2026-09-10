import type { Transaction } from "@oliumbi/database";
import type { ReservationInput } from "./forms";
import type { ReservableVariant } from "./reservation.types";

export function createReservationRepository(sql: Transaction) {
	return {
		async lockVariant(
			input: Pick<ReservationInput, "productId" | "variantId">,
		) {
			const [variant] = await sql<ReservableVariant[]>`
				SELECT p.name AS "productName", v.name AS "variantName",
						v.description, v.price, v.quantity,
						(p.visible AND p.reservable
						AND (p.starts_at IS NULL OR p.starts_at <= now())
						AND (p.ends_at IS NULL OR p.ends_at >= now())) AS available
				FROM zelglihof.product p
				JOIN zelglihof.product_variant v ON v.product_id = p.id
				WHERE p.id = ${input.productId} AND v.id = ${input.variantId}
				FOR UPDATE OF p, v
			`;
			return variant;
		},
		async decrementStock(variantId: string, quantity: number, now: Date) {
			await sql`
				UPDATE zelglihof.product_variant
				SET quantity = quantity - ${quantity}, updated_at = ${now}
				WHERE id = ${variantId} AND quantity IS NOT NULL
			`;
		},
		async insert(
			id: string,
			input: ReservationInput,
			variant: ReservableVariant,
			now: Date,
		) {
			await sql`
				INSERT INTO zelglihof.product_reservation (
					id, product_id, product_variant_id, product_name, variant_name,
					variant_description, variant_quantity, variant_price, name, phone,
					email, quantity, note, status, created_at, updated_at
				) VALUES (
					${id}, ${input.productId}, ${input.variantId}, ${variant.productName},
					${variant.variantName}, ${variant.description}, ${variant.quantity},
					${variant.price}, ${input.name}, ${input.phone}, ${input.email || null},
					${input.quantity}, ${input.note || null}, 'new', ${now}, ${now}
				)
			`;
		},
	};
}
