import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { formatTimestamp } from "../../../model/dates";
import {
	deleteSubscriber,
	getSubscriber,
	listSubscribers,
} from "../../../server/content/zelglihof/subscriber.functions";
import { SubscriberActions } from "../../subscriber-actions";
import { SubscriberInvite } from "../../subscriber-invite";
import { RecordField, RecordFields } from "../../ui/record-fields";
import { displayStatus } from "../display";
import { PageCollection } from "../page-collection";

export function SubscribersView() {
	return (
		<PageCollection<Subscriber>
			collection="zelglihof.subscriber"
			title="Abonnenten"
			rowKey={(record) => record.id}
			loadPage={(input) => listSubscribers({ data: input })}
			loadRecord={(id) => getSubscriber({ data: { id } })}
			remove={(record) => deleteSubscriber({ data: { id: record.id } })}
			capability={{
				mode: "read-only",
				renderDetails: (record) => (
					<RecordFields>
						<RecordField label={m.email()}>{record.email}</RecordField>
						<RecordField label={m.status()}>
							{displayStatus(record.status)}
						</RecordField>
						<RecordField label={m.studio_field_requested_at()}>
							{formatTimestamp(record.requestedAt)}
						</RecordField>
						<RecordField label={m.studio_field_confirmed_at()}>
							{formatTimestamp(record.confirmedAt)}
						</RecordField>
						<RecordField label={m.studio_field_unsubscribed_at()}>
							{formatTimestamp(record.unsubscribedAt)}
						</RecordField>
					</RecordFields>
				),
			}}
			columns={[
				{
					id: "email",
					heading: m.email(),
					render: (record) => record.email,
				},
				{
					id: "status",
					heading: m.status(),
					render: (record) => displayStatus(record.status),
				},
				{
					id: "confirmedAt",
					heading: m.studio_field_confirmed_at(),
					render: (record) => formatTimestamp(record.confirmedAt),
				},
			]}
			introduction={<SubscriberInvite />}
			renderActions={(record) => (
				<SubscriberActions key={record.id} subscriber={record} />
			)}
		/>
	);
}
