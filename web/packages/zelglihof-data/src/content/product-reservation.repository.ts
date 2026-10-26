import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { productReservation } from "../schema";
import type {
	ProductReservation,
	ProductReservationInput,
	ProductReservationKey,
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
		update: store.update,
		delete: store.delete,
		listForProduct: store.listScoped,
	});
}
