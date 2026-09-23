import type { Transaction } from "@oliumbi/database";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import type { ReservationInput } from "./forms";
import type { ReservableVariant } from "./reservation.types";
import { product, productReservation, productVariant } from "./schema";

export function createReservationRepository(transaction: Transaction) {
	return {
		async lockVariant(
			input: Pick<ReservationInput, "productId" | "variantId">,
		) {
			const [variant] = await transaction
				.select({
					productName: product.name,
					variantName: productVariant.name,
					description: productVariant.description,
					price: productVariant.price,
					quantity: productVariant.quantity,
					available: sql<boolean>`${product.visible} AND ${product.reservable} AND (${product.startsAt} IS NULL OR ${product.startsAt} <= now()) AND (${product.endsAt} IS NULL OR ${product.endsAt} >= now())`,
				})
				.from(product)
				.innerJoin(productVariant, eq(productVariant.productId, product.id))
				.where(
					and(
						eq(product.id, input.productId),
						eq(productVariant.id, input.variantId),
					),
				)
				.for("update");
			return variant;
		},
		async decrementStock(variantId: string, quantity: number, now: Date) {
			await transaction
				.update(productVariant)
				.set({
					quantity: sql`${productVariant.quantity} - ${quantity}`,
					updatedAt: now.toISOString(),
				})
				.where(
					and(
						eq(productVariant.id, variantId),
						isNotNull(productVariant.quantity),
					),
				);
		},
		async insert(
			id: string,
			input: ReservationInput,
			variant: ReservableVariant,
			now: Date,
		) {
			await transaction.insert(productReservation).values({
				id,
				productId: input.productId,
				productVariantId: input.variantId,
				productName: variant.productName,
				variantName: variant.variantName,
				variantDescription: variant.description,
				variantQuantity: variant.quantity,
				variantPrice: variant.price,
				name: input.name,
				phone: input.phone,
				email: input.email || null,
				quantity: input.quantity,
				note: input.note || null,
				status: "new",
				createdAt: now.toISOString(),
				updatedAt: now.toISOString(),
			});
		},
	};
}
