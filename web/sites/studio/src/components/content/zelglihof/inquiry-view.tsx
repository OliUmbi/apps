import { m } from "@oliumbi/i18n/messages";
import {
	type Inquiry,
	type InquiryInput,
	inquiryInputFromRecord,
	inquiryInputSchema,
	newInquiryInput,
} from "@oliumbi/zelglihof-data/content/inquiry";
import { inquiryStatusValues } from "@oliumbi/zelglihof-data/statuses";
import {
	deleteInquiry,
	getInquiry,
	listInquiries,
	updateInquiry,
} from "../../../server/content/zelglihof/inquiry.functions";
import { RecordField, RecordFields } from "../../ui/record-fields";
import type { EditorFieldsProps } from "../content-form";
import { displayStatus } from "../display";
import { StatusField } from "../editor-controls";
import { RoutedCollectionView } from "../routed-collection-view";

export function InquiriesView() {
	return (
		<RoutedCollectionView<Inquiry, InquiryInput>
			collection="zelglihof.inquiry"
			title="Anfragen"
			rowKey={(record) => record.id}
			loadPage={(input) => listInquiries({ data: input })}
			loadRecord={(id) => getInquiry({ data: { id } })}
			remove={(record) => deleteInquiry({ data: { id: record.id } })}
			update={(record, values) =>
				updateInquiry({
					data: { key: { id: record.id }, values, updatedAt: record.updatedAt },
				})
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
					heading: m.status(),
					render: (record) => displayStatus(record.status),
				},
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
					id: "email",
					heading: m.email(),
					render: (record) => record.email,
				},
			]}
			renderActions={(record) => (
				<RecordFields>
					<RecordField label={m.subject()}>{record.subject}</RecordField>
					<RecordField label={m.name()}>{record.name}</RecordField>
					<RecordField label={m.phone()}>{record.phone}</RecordField>
					<RecordField label={m.email()}>{record.email ?? "—"}</RecordField>
					<RecordField label={m.message()}>{record.message}</RecordField>
				</RecordFields>
			)}
		/>
	);
}

function InquiryFields({ values, onChange }: EditorFieldsProps<InquiryInput>) {
	return (
		<StatusField
			statuses={inquiryStatusValues}
			value={values.status}
			onChange={(value) => onChange("status", value)}
		/>
	);
}
