import { m } from "@oliumbi/i18n/messages";
import {
	type CommitmentInput,
	commitmentSchema,
} from "@oliumbi/jublawoma-data/contracts";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitCommitment } from "../../data/donations";
import { type PublicDonationItem, roundQuantity } from "../../model/donations";
import { SubmissionForm } from "../submission-form";

export function DonationCommitmentForm({
	donationId,
	item,
}: {
	donationId: string;
	item: PublicDonationItem;
}) {
	const router = useRouter();
	const submit = useServerFn(submitCommitment);
	async function sendCommitment(data: CommitmentInput) {
		const result = await submit({ data });
		await router.invalidate();
		return result;
	}
	const remaining = roundQuantity(item.remaining);
	const step = roundQuantity(item.step);
	return (
		<aside className="donation-action">
			<p className="kicker">{m.jublawoma_donation_form_eyebrow()}</p>
			<h3>{item.name}</h3>
			<SubmissionForm
				className="donation-form"
				schema={commitmentSchema}
				defaults={{ donationId, itemId: item.id }}
				submit={sendCommitment}
				getResultError={(result) =>
					result.outcome === "unavailable" ? m.unavailable() : null
				}
				success={m.jublawoma_donation_success()}
				submitLabel={m.jublawoma_donation_submit()}
				fields={[
					{
						name: "name",
						label: m.name(),
						required: true,
					},
					{
						name: "phone",
						label: m.phone(),
						type: "tel",
						required: true,
					},
					{
						name: "quantity",
						label: item.unit,
						type: "number",
						min: step,
						max: remaining,
						step,
						required: true,
					},
					{
						name: "note",
						label: m.note(),
						type: "textarea",
						rows: 2,
					},
				]}
			/>
		</aside>
	);
}
