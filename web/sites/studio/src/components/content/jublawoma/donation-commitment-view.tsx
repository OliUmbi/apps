import { m } from "@oliumbi/i18n/messages";
import type { DonationCommitment } from "@oliumbi/jublawoma-data/content/donation-commitment";
import {
	deleteDonationCommitment,
	getDonationCommitment,
	listDonationCommitments,
} from "../../../server/content/jublawoma/donation-commitment.functions";
import { CollectionView } from "../collection-view";
import { DetailItem } from "../display";

export function DonationCommitmentsView({
	donationId,
}: {
	donationId: string;
}) {
	return (
		<CollectionView<DonationCommitment>
			collection="jublawoma.donation_commitment"
			title="Zusagen"
			scope={donationId}
			inline
			rowKey={(record) => record.id}
			loadPage={(input) =>
				listDonationCommitments({ data: { ...input, donationId } })
			}
			loadRecord={(id) => getDonationCommitment({ data: { id } })}
			remove={(record) => deleteDonationCommitment({ data: { id: record.id } })}
			columns={[
				{
					id: "name",
					heading: m.studio_field_name(),
					render: (record) => record.name,
				},
				{
					id: "phone",
					heading: m.studio_field_phone(),
					render: (record) => record.phone,
				},
				{
					id: "itemName",
					heading: m.studio_field_item_name(),
					render: (record) => record.itemName,
				},
				{
					id: "quantity",
					heading: m.studio_field_quantity(),
					render: (record) => record.quantity,
				},
				{
					id: "unit",
					heading: m.studio_field_unit(),
					render: (record) => record.unit,
				},
			]}
			renderDetails={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.studio_field_donation_id()}>
						{record.donationId}
					</DetailItem>
					<DetailItem label={m.studio_field_donation_item_id()}>
						{record.donationItemId}
					</DetailItem>
					<DetailItem label={m.studio_field_donation_title()}>
						{record.donationTitle}
					</DetailItem>
					<DetailItem label={m.studio_field_item_name()}>
						{record.itemName}
					</DetailItem>
					<DetailItem label={m.studio_field_item_detail()}>
						{record.itemDetail}
					</DetailItem>
					<DetailItem label={m.studio_field_item_quantity()}>
						{record.itemQuantity}
					</DetailItem>
					<DetailItem label={m.studio_field_step()}>{record.step}</DetailItem>
					<DetailItem label={m.studio_field_unit()}>{record.unit}</DetailItem>
					<DetailItem label={m.studio_field_name()}>{record.name}</DetailItem>
					<DetailItem label={m.studio_field_phone()}>{record.phone}</DetailItem>
					<DetailItem label={m.studio_field_quantity()}>
						{record.quantity}
					</DetailItem>
					<DetailItem label={m.studio_field_note()}>{record.note}</DetailItem>
				</dl>
			)}
		/>
	);
}
