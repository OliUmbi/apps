import { mapErrors } from "@oliumbi/contracts";
import type { DatabasePool } from "@oliumbi/database";
import { referenceFor } from "@oliumbi/queue/email";
import { createCommitmentRepository } from "./donation.repository";
import type {
	CommitmentItem,
	CommitmentOutcome,
	CommitmentResult,
} from "./donation.types";
import { type CommitmentInput, commitmentSchema } from "./forms";

interface Scaled {
	value: bigint;
	scale: number;
}

// Decimal arithmetic runs on BigInt integers scaled to a common power of ten;
// float64 rounding must never influence an increment or capacity decision.
function scaled(quantity: string): Scaled {
	const [whole, fraction = ""] = quantity.split(".");
	return { value: BigInt(whole + fraction), scale: fraction.length };
}

function atScale(quantity: Scaled, scale: number): bigint {
	return quantity.value * 10n ** BigInt(scale - quantity.scale);
}

function decimalString(value: bigint, scale: number): string {
	const digits = value.toString().padStart(scale + 1, "0");
	const cut = digits.length - scale;
	const fraction = digits.slice(cut).replace(/0+$/, "");
	return fraction
		? `${digits.slice(0, cut)}.${fraction}`
		: digits.slice(0, cut);
}

export function addDecimals(left: string, right: string): string {
	const a = scaled(left);
	const b = scaled(right);
	const scale = Math.max(a.scale, b.scale);
	return decimalString(atScale(a, scale) + atScale(b, scale), scale);
}

export function compareDecimals(left: string, right: string): -1 | 0 | 1 {
	const a = scaled(left);
	const b = scaled(right);
	const scale = Math.max(a.scale, b.scale);
	const difference = atScale(a, scale) - atScale(b, scale);
	return difference === 0n ? 0 : difference > 0n ? 1 : -1;
}

export function validIncrement(quantity: string, step: string) {
	const q = scaled(quantity);
	const s = scaled(step);
	if (s.value <= 0n) return false;
	const scale = Math.max(q.scale, s.scale);
	return atScale(q, scale) % atScale(s, scale) === 0n;
}

export interface CommitmentPlan {
	outcome: CommitmentOutcome;
	insert: boolean;
}

// Pure decision points stay testable without a database. A replayed submission
// reports the original outcome and never writes again. The refused fills name
// their cause (missing item, inactive donation, oversold, wrong increment) so
// callers can tell them apart instead of sharing one "unavailable".
export function decideCommitment(input: {
	replayed: boolean;
	item: Pick<CommitmentItem, "active" | "quantity" | "step"> | null | undefined;
	quantity: string;
	committed: string;
}): CommitmentPlan {
	if (input.replayed) return { outcome: "committed", insert: false };
	const item = input.item;
	if (!item) return { outcome: "not-found", insert: false };
	if (!item.active) return { outcome: "inactive", insert: false };
	if (!validIncrement(input.quantity, item.step))
		return { outcome: "invalid-increment", insert: false };
	if (
		compareDecimals(
			addDecimals(input.committed, input.quantity),
			item.quantity,
		) > 0
	)
		return { outcome: "oversold", insert: false };
	return { outcome: "committed", insert: true };
}

export function createDonationService(database: DatabasePool) {
	return {
		commit(input: CommitmentInput): Promise<CommitmentResult> {
			// One boundary: schema failures leave typed as validation verdicts and
			// driver failures as classified conflict/not-found/internal errors.
			return mapErrors(async () => {
				const values = commitmentSchema.parse(input);
				const reference = referenceFor(values.submissionId);
				const committed: CommitmentResult = { outcome: "committed", reference };
				return database.transaction(async (transaction) => {
					const repository = createCommitmentRepository(transaction);
					// The item lock serializes concurrent fills; a retry sees the original row.
					const item = await repository.lockItem(values);
					const plan = decideCommitment({
						replayed:
							(await repository.findBySubmissionId(values.submissionId)) !==
							null,
						item,
						quantity: values.quantity,
						committed: await repository.committedQuantity(values.itemId),
					});
					if (plan.outcome !== "committed") return { outcome: plan.outcome };
					// The unique submission index absorbs a lost insert race to one row.
					if (plan.insert && item)
						await repository.insert(values, item, new Date());
					return committed;
				});
			});
		},
	};
}
