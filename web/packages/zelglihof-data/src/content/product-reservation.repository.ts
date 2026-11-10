import { AppError, guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { and, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { productReservation, productVariant } from "../schema";
import { ConcurrentUpdateError } from "./errors";
import {
	decideReservationCancellation,
	type ProductReservation,
	type ProductReservationInput,
	type ProductReservationKey,
} from "./product-reservation";

export function createProductReservationRepository(db: DatabaseExecutor) {
	// No create: reservation rows are written by the reservation workflow with
	// their stored snapshots. Orphaned reservations (deleted product) stay listed
	// here; the scoped list only shows a product's own rows.
	const store = createContentRepository<
		ProductReservation,
		ProductReservationKey,
		ProductReservationInput
	>(db, {
		table: productReservation,
		name: "zelglihof.product_reservation",
		key: { id: productReservation.id },
		search: productReservation.name,
		createdAt: productReservation.createdAt,
		updatedAt: productReservation.updatedAt,
		scope: productReservation.productId,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		async update(
			key: ProductReservationKey,
			input: ProductReservationInput,
			expectedUpdatedAt: string,
		) {
			const current = await store.get(key);
			// Cancellation is its own transition with stock restoration and audit
			// metadata; the generic status editor must never spell it, and a
			// cancelled reservation is final.
			if (input.status === "cancelled")
				throw new AppError(
					"forbidden",
					"Reservations are cancelled through the dedicated cancellation action",
				);
			if (current?.status === "cancelled")
				throw new AppError(
					"forbidden",
					"Cancelled reservations cannot change status",
				);
			return store.update(key, input, expectedUpdatedAt);
		},
		// Explicit cancellation: the caller runs this inside one transaction so
		// the reservation row and the variant stock it restores are locked and
		// written atomically. The status and updatedAt guards make a second
		// cancellation a refusal, never a second stock restoration.
		async cancel(
			key: ProductReservationKey,
			expectedUpdatedAt: string,
			actor: string,
			reason: string | null,
		): Promise<ProductReservation> {
			const [current] = await db
				.select()
				.from(productReservation)
				.where(eq(productReservation.id, key.id))
				.for("update");
			if (!current) throw new AppError("not-found", "Reservation not found");
			if (current.updatedAt !== expectedUpdatedAt)
				throw new ConcurrentUpdateError("zelglihof.product_reservation");

			// Lock the variant before deciding restoration, so a concurrent stock
			// change cannot race this cancellation.
			let variant: { quantity: number | null } | null = null;
			if (current.variantQuantity !== null && current.productVariantId) {
				const [locked] = await db
					.select({
						quantity: productVariant.quantity,
					})
					.from(productVariant)
					.where(eq(productVariant.id, current.productVariantId))
					.for("update");
				variant = locked ?? null;
			}
			const plan = decideReservationCancellation({
				status: current.status,
				variantQuantity: current.variantQuantity,
				variantExists: variant !== null,
				variantCurrentQuantity: variant?.quantity ?? null,
			});
			if (!plan.allowed)
				throw new AppError(
					"forbidden",
					current.status === "cancelled"
						? "Reservation is already cancelled"
						: "Only new or in-progress reservations can be cancelled",
				);

			const now = new Date().toISOString();
			if (plan.restoreStock && current.productVariantId)
				await db
					.update(productVariant)
					.set({
						quantity: sql`${productVariant.quantity} + ${current.quantity}`,
						updatedAt: now,
					})
					.where(
						and(
							eq(productVariant.id, current.productVariantId),
							isNotNull(productVariant.quantity),
						),
					);

			const [updated] = await db
				.update(productReservation)
				.set({
					status: "cancelled",
					cancelledAt: now,
					cancelledBy: actor,
					cancellationReason: reason,
					stockRestored: plan.restoreStock,
					updatedAt: now,
				})
				.where(
					and(
						eq(productReservation.id, key.id),
						eq(productReservation.updatedAt, expectedUpdatedAt),
						inArray(productReservation.status, ["new", "in-progress"]),
						isNull(productReservation.cancelledAt),
					),
				)
				.returning();
			if (!updated)
				throw new ConcurrentUpdateError("zelglihof.product_reservation");
			return updated as ProductReservation;
		},
		async delete(_key: ProductReservationKey) {
			throw new AppError("forbidden", "Reservation history cannot be deleted");
		},
		listForProduct: store.listScoped,
	});
}
