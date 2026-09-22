import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "../../../model/content/zelglihof/subscriber";
import {
	deleteSubscriber,
	getSubscriber,
	listSubscribers,
} from "../../../server/content/zelglihof/subscriber.functions";
import { SubscriberActions } from "../../subscriber-actions";
import { SubscriberInvite } from "../../subscriber-invite";
import { CollectionView } from "../collection-view";
import { DetailItem, displayStatus, displayTimestamp } from "../display";

export function SubscribersView() {
	return (
		<CollectionView<Subscriber>
			collection="zelglihof.subscriber"
			title="Abonnenten"
			rowKey={(record) => record.id}
			loadPage={(input) => listSubscribers({ data: input })}
			loadRecord={(id) => getSubscriber({ data: { id } })}
			remove={(record) => deleteSubscriber({ data: { id: record.id } })}
			columns={[
				{
					id: "email",
					heading: m.studio_field_email(),
					render: (record) => record.email,
				},
				{
					id: "status",
					heading: m.studio_field_status(),
					render: (record) => displayStatus(record.status),
				},
				{
					id: "confirmedAt",
					heading: m.studio_field_confirmed_at(),
					render: (record) => displayTimestamp(record.confirmedAt),
				},
			]}
			renderDetails={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.studio_field_email()}>{record.email}</DetailItem>
					<DetailItem label={m.studio_field_status()}>
						{displayStatus(record.status)}
					</DetailItem>
					<DetailItem label={m.studio_field_requested_at()}>
						{displayTimestamp(record.requestedAt)}
					</DetailItem>
					<DetailItem label={m.studio_field_confirmed_at()}>
						{displayTimestamp(record.confirmedAt)}
					</DetailItem>
					<DetailItem label={m.studio_field_unsubscribed_at()}>
						{displayTimestamp(record.unsubscribedAt)}
					</DetailItem>
				</dl>
			)}
			introduction={<SubscriberInvite />}
			renderActions={(record) => <SubscriberActions record={record} />}
		/>
	);
}
