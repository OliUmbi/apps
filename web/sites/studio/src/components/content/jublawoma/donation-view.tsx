import { m } from "@oliumbi/i18n/messages";
import {
	type Donation,
	type DonationInput,
	donationInputFromRecord,
	donationInputSchema,
	newDonationInput,
} from "@oliumbi/jublawoma-data/content/donation";
import { formatTimestamp } from "../../../model/dates";
import {
	createDonation,
	deleteDonation,
	getDonation,
	listDonations,
	updateDonation,
} from "../../../server/content/jublawoma/donation.functions";
import { DateField } from "../../ui/date-field";
import { TextField } from "../../ui/text-field";
import type { EditorFieldsProps } from "../content-form";

import { PageCollection } from "../page-collection";
import { DonationCommitmentsRelated } from "./donation-commitment-view";
import { DonationItemsRelated } from "./donation-item-view";

export function DonationsView() {
	return (
		<PageCollection<Donation, DonationInput>
			collection="jublawoma.donation"
			title="Spendenaktionen"
			rowKey={(record) => record.id}
			loadPage={(input) => listDonations({ data: input })}
			loadRecord={(id) => getDonation({ data: { id } })}
			remove={(record) => deleteDonation({ data: { id: record.id } })}
			capability={{
				mode: "creatable",
				editor: {
					schema: donationInputSchema,
					initialValues: newDonationInput,
					valuesFromRecord: donationInputFromRecord,
					renderFields: (props) => <DonationFields {...props} />,
				},
				create: (values) => createDonation({ data: values }),
				update: (record, values) =>
					updateDonation({
						data: {
							key: { id: record.id },
							values,
							updatedAt: record.updatedAt,
						},
					}),
			}}
			columns={[
				{
					id: "title",
					heading: m.title(),
					render: (record) => record.title,
				},
				{
					id: "contact",
					heading: m.contact(),
					render: (record) => record.contact,
				},
				{
					id: "startsAt",
					heading: m.studio_field_starts_at(),
					render: (record) => formatTimestamp(record.startsAt),
				},
				{
					id: "endsAt",
					heading: m.studio_field_ends_at(),
					render: (record) => formatTimestamp(record.endsAt),
				},
			]}
			renderRelated={(record) => (
				<div className="grid gap-4">
					<DonationItemsRelated
						key={`donation_item:${record.id}`}
						donationId={record.id}
					/>
					<DonationCommitmentsRelated
						key={`donation_commitment:${record.id}`}
						donationId={record.id}
					/>
				</div>
			)}
		/>
	);
}

function DonationFields({
	values,
	onChange,
}: EditorFieldsProps<DonationInput>) {
	return (
		<>
			<TextField
				name="title"
				label={m.title()}
				value={values.title}
				required
				onChange={(event) => onChange("title", event.target.value)}
			/>
			<TextField
				name="description"
				label={m.description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<TextField
				name="contact"
				label={m.contact()}
				value={values.contact}
				required
				onChange={(event) => onChange("contact", event.target.value)}
			/>
			<DateField
				name="startsAt"
				label={m.studio_field_starts_at()}
				value={values.startsAt}
				includeTime
				onChange={(value) => onChange("startsAt", value ?? "")}
			/>
			<DateField
				name="endsAt"
				label={m.studio_field_ends_at()}
				value={values.endsAt}
				includeTime
				onChange={(value) => onChange("endsAt", value ?? "")}
			/>
		</>
	);
}
