import { m } from "@oliumbi/i18n/messages";
import {
	type Campaign,
	type CampaignInput,
	campaignInputFromRecord,
	campaignInputSchema,
	newCampaignInput,
} from "@oliumbi/zelglihof-data/content/campaign";
import {
	createCampaign,
	deleteCampaign,
	getCampaign,
	listCampaigns,
	updateCampaign,
} from "../../../server/content/zelglihof/campaign.functions";
import { CampaignSend } from "../../campaign-send";
import { RecordField, RecordFields } from "../../ui/record-fields";
import { TextField } from "../../ui/text-field";
import type { EditorFieldsProps } from "../content-form";
import { displayStatus } from "../display";
import { PageCollection } from "../page-collection";

export function CampaignsView() {
	return (
		<PageCollection<Campaign, CampaignInput>
			collection="zelglihof.campaign"
			title="Kampagnen"
			rowKey={(record) => record.id}
			loadPage={(input) => listCampaigns({ data: input })}
			loadRecord={(id) => getCampaign({ data: { id } })}
			remove={(record) => deleteCampaign({ data: { id: record.id } })}
			capability={{
				mode: "creatable",
				editor: {
					schema: campaignInputSchema,
					initialValues: newCampaignInput,
					valuesFromRecord: campaignInputFromRecord,
					renderFields: (props) => <CampaignFields {...props} />,
				},
				create: (values) => createCampaign({ data: values }),
				update: (record, values) =>
					updateCampaign({
						data: {
							key: { id: record.id },
							values,
							updatedAt: record.updatedAt,
						},
					}),
				fallback: {
					canEdit: (record) => record.status === "draft",
					renderDetails: (record) => (
						<RecordFields>
							<RecordField label={m.subject()}>{record.subject}</RecordField>
							<RecordField label={m.body()}>{record.body}</RecordField>
							<RecordField label={m.status()}>
								{displayStatus(record.status)}
							</RecordField>
						</RecordFields>
					),
				},
			}}
			columns={[
				{
					id: "subject",
					heading: m.subject(),
					render: (record) => record.subject,
				},
				{
					id: "status",
					heading: m.status(),
					render: (record) => displayStatus(record.status),
				},
			]}
			renderActions={(record) =>
				record.status === "draft" ? <CampaignSend id={record.id} /> : null
			}
		/>
	);
}

function CampaignFields({
	values,
	onChange,
}: EditorFieldsProps<CampaignInput>) {
	return (
		<>
			<TextField
				name="subject"
				label={m.subject()}
				value={values.subject}
				required
				onChange={(event) => onChange("subject", event.target.value)}
			/>
			<TextField
				name="body"
				label={m.body()}
				value={values.body}
				required
				render={<textarea rows={18} />}
				onChange={(event) => onChange("body", event.target.value)}
			/>
		</>
	);
}
