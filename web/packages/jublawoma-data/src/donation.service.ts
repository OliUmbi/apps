import type { DatabasePool } from "@oliumbi/database";
import { createDonationRepository } from "./donation.repository";
import { type CommitmentInput, commitmentSchema } from "./forms";

const INCREMENT_TOLERANCE = 1e-8;
export function validIncrement(quantity: number, step: number) {
	return (
		step > 0 &&
		Math.abs(quantity / step - Math.round(quantity / step)) <
			INCREMENT_TOLERANCE
	);
}
export function createDonationService(database: DatabasePool) {
	return {
		commit(input: CommitmentInput) {
			const values = commitmentSchema.parse(input);
			return database.transaction(async (sql) => {
				const repository = createDonationRepository(sql);
				const item = await repository.lockItem(values);
				if (!item?.active || !validIncrement(values.quantity, item.step)) {
					return { outcome: "unavailable" as const };
				}
				const committed = await repository.committedQuantity(values.itemId);
				if (committed + values.quantity > item.quantity)
					return { outcome: "unavailable" as const };
				await repository.insert(values, item, new Date());
				return { outcome: "committed" as const };
			});
		},
	};
}
