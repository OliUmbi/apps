import { m } from "@oliumbi/i18n/messages";
import {
	type DonationItem,
	type DonationItemInput,
	donationItemInputFromRecord,
	donationItemInputSchema,
	newDonationItemInput,
} from "@oliumbi/jublawoma-data/content/donation-item";
import {
	createDonationItem,
	deleteDonationItem,
	getDonationItem,
	listDonationItems,
	updateDonationItem,
} from "../../../server/content/jublawoma/donation-item.functions";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { NumberField } from "../editor-controls";
import { InlineCollectionView } from "../inline-collection-view";

export function DonationItemsView({ donationId }: { donationId: string }) {
	return (
		<InlineCollectionView<DonationItem, DonationItemInput>
			collection="jublawoma.donation_item"
			title="Spendenbedarf"
			scope={donationId}
			rowKey={(record) => record.id}
			loadPage={(input) =>
				listDonationItems({ data: { ...input, donationId } })
			}
			loadRecord={(id) => getDonationItem({ data: { id } })}
			remove={(record) => deleteDonationItem({ data: { id: record.id } })}
			create={(values) => createDonationItem({ data: values })}
			update={(record, values) =>
				updateDonationItem({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: donationItemInputSchema,
				initialValues: () => newDonationItemInput(donationId),
				valuesFromRecord: donationItemInputFromRecord,
				renderFields: (props) => <DonationItemFields {...props} />,
			}}
			columns={[
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "detail",
					heading: m.studio_field_detail(),
					render: (record) => record.detail,
				},
				{
					id: "quantity",
					heading: m.quantity(),
					render: (record) => record.quantity,
				},
				{
					id: "step",
					heading: m.studio_field_step(),
					render: (record) => record.step,
				},
				{
					id: "unit",
					heading: m.unit(),
					render: (record) => record.unit,
				},
			]}
		/>
	);
}

function DonationItemFields({
	values,
	onChange,
}: EditorFieldsProps<DonationItemInput>) {
	return (
		<>
			<InputField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<InputField
				name="detail"
				label={m.studio_field_detail()}
				value={values.detail ?? ""}
				onChange={(event) => onChange("detail", event.target.value || null)}
			/>
			<NumberField
				name="quantity"
				label={m.quantity()}
				value={values.quantity}
				min={0}
				step={"any"}
				required
				onChange={(value) => onChange("quantity", value ?? Number.NaN)}
			/>
			<NumberField
				name="step"
				label={m.studio_field_step()}
				value={values.step}
				min={0.000001}
				step={"any"}
				required
				onChange={(value) => onChange("step", value ?? Number.NaN)}
			/>
			<InputField
				name="unit"
				label={m.unit()}
				value={values.unit}
				required
				onChange={(event) => onChange("unit", event.target.value)}
			/>
		</>
	);
}
