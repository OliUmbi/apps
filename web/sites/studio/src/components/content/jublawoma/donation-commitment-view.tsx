import { m } from "@oliumbi/i18n/messages";
import type { DonationCommitment } from "@oliumbi/jublawoma-data/content/donation-commitment";
import {
	deleteDonationCommitment,
	getDonationCommitment,
	listDonationCommitments,
} from "../../../server/content/jublawoma/donation-commitment.functions";
import { RecordField, RecordFields } from "../../ui/record-fields";
import { InlineCollectionView } from "../inline-collection-view";

export function DonationCommitmentsView({
	donationId,
}: {
	donationId: string;
}) {
	return (
		<InlineCollectionView<DonationCommitment>
			collection="jublawoma.donation_commitment"
			title="Zusagen"
			scope={donationId}
			rowKey={(record) => record.id}
			loadPage={(input) =>
				listDonationCommitments({ data: { ...input, donationId } })
			}
			loadRecord={(id) => getDonationCommitment({ data: { id } })}
			remove={(record) => deleteDonationCommitment({ data: { id: record.id } })}
			columns={[
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "phone",
					heading: m.phone(),
					render: (record) => record.phone,
				},
				{
					id: "itemName",
					heading: m.studio_field_item_name(),
					render: (record) => record.itemName,
				},
				{
					id: "quantity",
					heading: m.quantity(),
					render: (record) => record.quantity,
				},
				{
					id: "unit",
					heading: m.unit(),
					render: (record) => record.unit,
				},
			]}
			renderDetails={(record) => (
				<RecordFields>
					<RecordField label={m.studio_donation()}>
						{record.donationId ?? "—"}
					</RecordField>
					<RecordField label={m.studio_donation_item()}>
						{record.donationItemId ?? "—"}
					</RecordField>
					<RecordField label={m.studio_field_donation_title()}>
						{record.donationTitle}
					</RecordField>
					<RecordField label={m.studio_field_item_name()}>
						{record.itemName}
					</RecordField>
					<RecordField label={m.studio_field_item_detail()}>
						{record.itemDetail ?? "—"}
					</RecordField>
					<RecordField label={m.studio_field_item_quantity()}>
						{record.itemQuantity}
					</RecordField>
					<RecordField label={m.studio_field_step()}>{record.step}</RecordField>
					<RecordField label={m.unit()}>{record.unit}</RecordField>
					<RecordField label={m.name()}>{record.name}</RecordField>
					<RecordField label={m.phone()}>{record.phone}</RecordField>
					<RecordField label={m.quantity()}>{record.quantity}</RecordField>
					<RecordField label={m.studio_field_note()}>
						{record.note ?? "—"}
					</RecordField>
				</RecordFields>
			)}
		/>
	);
}
