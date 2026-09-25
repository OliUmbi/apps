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
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { DetailItem, displayStatus } from "../display";
import { RoutedCollectionView } from "../routed-collection-view";

export function CampaignsView() {
	return (
		<RoutedCollectionView<Campaign, CampaignInput>
			collection="zelglihof.campaign"
			title="Kampagnen"
			rowKey={(record) => record.id}
			loadPage={(input) => listCampaigns({ data: input })}
			loadRecord={(id) => getCampaign({ data: { id } })}
			remove={(record) => deleteCampaign({ data: { id: record.id } })}
			create={(values) => createCampaign({ data: values })}
			update={(record, values) =>
				updateCampaign({ data: { key: { id: record.id }, values } })
			}
			canEdit={(record) => record.status === "draft"}
			editor={{
				schema: campaignInputSchema,
				initialValues: newCampaignInput,
				valuesFromRecord: campaignInputFromRecord,
				renderFields: (props) => <CampaignFields {...props} />,
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
			renderDetails={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.subject()}>{record.subject}</DetailItem>
					<DetailItem label={m.body()}>{record.body}</DetailItem>
					<DetailItem label={m.status()}>
						{displayStatus(record.status)}
					</DetailItem>
				</dl>
			)}
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
			<InputField
				name="subject"
				label={m.subject()}
				value={values.subject}
				required
				onChange={(event) => onChange("subject", event.target.value)}
			/>
			<InputField
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
