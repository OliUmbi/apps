import { guardRepository, type Page, type PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { productReservation } from "../schema";
import { updateMissError } from "./errors";
import type {
	ProductReservation,
	ProductReservationInput,
	ProductReservationKey,
} from "./product-reservation";

export function createProductReservationRepository(db: DatabaseExecutor) {
	return guardRepository({
		// Orphaned reservations (deleted product) stay listed here with their
		// stored snapshots; the scoped list only shows a product's own rows.
		list(input: PageInput): Promise<Page<ProductReservation>> {
			return paginate<ProductReservation>(
				db
					.select()
					.from(productReservation)
					.where(
						input.search
							? ilike(productReservation.name, searchPattern(input.search))
							: undefined,
					)
					.orderBy(desc(productReservation.createdAt), productReservation.id)
					.$dynamic(),
				input,
			);
		},
		async get(key: ProductReservationKey): Promise<ProductReservation | null> {
			const [record] = await db
				.select()
				.from(productReservation)
				.where(eq(productReservation.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async update(
			key: ProductReservationKey,
			input: ProductReservationInput,
			expectedUpdatedAt: string,
		): Promise<ProductReservation> {
			const [record] = await db
				.update(productReservation)
				.set({ status: input.status, updatedAt: new Date().toISOString() })
				.where(
					and(
						eq(productReservation.id, key.id),
						eq(productReservation.updatedAt, expectedUpdatedAt),
					),
				)
				.returning();
			if (!record)
				throw updateMissError(
					"zelglihof.product_reservation",
					await this.get(key),
					expectedUpdatedAt,
				);
			return record;
		},
		async delete(key: ProductReservationKey): Promise<void> {
			await db
				.delete(productReservation)
				.where(eq(productReservation.id, key.id));
		},
		listForProduct(
			input: PageInput,
			productId: string,
		): Promise<Page<ProductReservation>> {
			return paginate<ProductReservation>(
				db
					.select()
					.from(productReservation)
					.where(
						and(
							eq(productReservation.productId, productId),
							input.search
								? ilike(productReservation.name, searchPattern(input.search))
								: undefined,
						),
					)
					.orderBy(desc(productReservation.createdAt), productReservation.id)
					.$dynamic(),
				input,
			);
		},
	});
}
