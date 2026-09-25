import { m } from "@oliumbi/i18n/messages";
import type { DonationCommitment } from "@oliumbi/jublawoma-data/content/donation-commitment";
import {
	deleteDonationCommitment,
	getDonationCommitment,
	listDonationCommitments,
} from "../../../server/content/jublawoma/donation-commitment.functions";
import { DetailItem } from "../display";
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
				<dl className="record-fields">
					<DetailItem label={m.studio_donation()}>
						{record.donationId}
					</DetailItem>
					<DetailItem label={m.studio_donation_item()}>
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
					<DetailItem label={m.unit()}>{record.unit}</DetailItem>
					<DetailItem label={m.name()}>{record.name}</DetailItem>
					<DetailItem label={m.phone()}>{record.phone}</DetailItem>
					<DetailItem label={m.quantity()}>{record.quantity}</DetailItem>
					<DetailItem label={m.studio_field_note()}>{record.note}</DetailItem>
				</dl>
			)}
		/>
	);
}
