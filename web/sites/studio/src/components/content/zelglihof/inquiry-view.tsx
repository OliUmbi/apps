import { m } from "@oliumbi/i18n/messages";
import {
	type Inquiry,
	type InquiryInput,
	inquiryInputFromRecord,
	inquiryInputSchema,
	newInquiryInput,
} from "../../../model/content/zelglihof/inquiry";
import {
	deleteInquiry,
	getInquiry,
	listInquiries,
	updateInquiry,
} from "../../../server/content/zelglihof/inquiry.functions";
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { DetailItem, displayStatus } from "../display";
import { StatusField } from "../editor-controls";

export function InquiriesView() {
	return (
		<CollectionView<Inquiry, InquiryInput>
			collection="zelglihof.inquiry"
			title="Anfragen"
			rowKey={(record) => record.id}
			loadPage={(input) => listInquiries({ data: input })}
			loadRecord={(id) => getInquiry({ data: { id } })}
			remove={(record) => deleteInquiry({ data: { id: record.id } })}
			update={(record, values) =>
				updateInquiry({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: inquiryInputSchema,
				initialValues: newInquiryInput,
				valuesFromRecord: inquiryInputFromRecord,
				renderFields: (props) => <InquiryFields {...props} />,
			}}
			columns={[
				{
					id: "status",
					heading: m.studio_field_status(),
					render: (record) => displayStatus(record.status),
				},
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
					id: "email",
					heading: m.studio_field_email(),
					render: (record) => record.email,
				},
			]}
			renderActions={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.studio_field_name()}>{record.name}</DetailItem>
					<DetailItem label={m.studio_field_phone()}>{record.phone}</DetailItem>
					<DetailItem label={m.studio_field_email()}>{record.email}</DetailItem>
					<DetailItem label={m.studio_field_message()}>
						{record.message}
					</DetailItem>
				</dl>
			)}
		/>
	);
}

function InquiryFields({ values, onChange }: EditorFieldsProps<InquiryInput>) {
	return (
		<StatusField
			value={values.status}
			onChange={(value) => onChange("status", value)}
		/>
	);
}
