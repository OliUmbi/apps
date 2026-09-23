import type { PageInput } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate, searchPattern } from "@oliumbi/database/pagination";
import { and, desc, eq, ilike } from "drizzle-orm";
import { productReservation } from "../schema";
import type {
	ProductReservationInput,
	ProductReservationKey,
} from "./product-reservation";

export function createProductReservationRepository(db: DatabaseExecutor) {
	return {
		list(input: PageInput) {
			return paginate(
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
		async get(key: ProductReservationKey) {
			const [record] = await db
				.select()
				.from(productReservation)
				.where(eq(productReservation.id, key.id))
				.limit(1);
			return record ?? null;
		},
		async update(key: ProductReservationKey, input: ProductReservationInput) {
			const [record] = await db
				.update(productReservation)
				.set({ status: input.status, updatedAt: new Date().toISOString() })
				.where(eq(productReservation.id, key.id))
				.returning();
			if (!record) throw new Error("Record not found or no longer editable");
			return record;
		},
		async delete(key: ProductReservationKey): Promise<void> {
			await db
				.delete(productReservation)
				.where(eq(productReservation.id, key.id));
		},
		listForProduct(input: PageInput, productId: string) {
			return paginate(
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
	};
}
