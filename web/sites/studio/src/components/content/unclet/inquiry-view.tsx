import { m } from "@oliumbi/i18n/messages";
import {
	type Inquiry,
	type InquiryInput,
	inquiryInputFromRecord,
	inquiryInputSchema,
	newInquiryInput,
} from "@oliumbi/unclet-data/content/inquiry";
import { formatDate } from "../../../model/dates";
import {
	deleteInquiry,
	getInquiry,
	listInquiries,
	updateInquiry,
} from "../../../server/content/unclet/inquiry.functions";
import type { EditorFieldsProps } from "../content-form";
import { DetailItem, displayStatus } from "../display";
import { StatusField } from "../editor-controls";
import { RoutedCollectionView } from "../routed-collection-view";

export function InquiriesView() {
	return (
		<RoutedCollectionView<Inquiry, InquiryInput>
			collection="unclet.inquiry"
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
					heading: m.status(),
					render: (record) => displayStatus(record.status),
				},
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "email",
					heading: m.email(),
					render: (record) => record.email,
				},
				{
					id: "phone",
					heading: m.phone(),
					render: (record) => record.phone,
				},
				{
					id: "eventOn",
					heading: m.studio_field_event_on(),
					render: (record) => formatDate(record.eventOn),
				},
			]}
			renderActions={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.name()}>{record.name}</DetailItem>
					<DetailItem label={m.email()}>{record.email}</DetailItem>
					<DetailItem label={m.phone()}>{record.phone}</DetailItem>
					<DetailItem label={m.studio_field_event_on()}>
						{formatDate(record.eventOn)}
					</DetailItem>
					<DetailItem label={m.location()}>{record.location}</DetailItem>
					<DetailItem label={m.studio_field_guest_count()}>
						{record.guestCount}
					</DetailItem>
					<DetailItem label={m.studio_field_note()}>{record.note}</DetailItem>
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
