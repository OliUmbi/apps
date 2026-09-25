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
import { DetailItem, displayStatus } from "../display";
import { RoutedCollectionView } from "../routed-collection-view";

export function SubscribersView() {
	return (
		<RoutedCollectionView<Subscriber>
			collection="zelglihof.subscriber"
			title="Abonnenten"
			rowKey={(record) => record.id}
			loadPage={(input) => listSubscribers({ data: input })}
			loadRecord={(id) => getSubscriber({ data: { id } })}
			remove={(record) => deleteSubscriber({ data: { id: record.id } })}
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
			renderDetails={(record) => (
				<dl className="record-fields">
					<DetailItem label={m.email()}>{record.email}</DetailItem>
					<DetailItem label={m.status()}>
						{displayStatus(record.status)}
					</DetailItem>
					<DetailItem label={m.studio_field_requested_at()}>
						{formatTimestamp(record.requestedAt)}
					</DetailItem>
					<DetailItem label={m.studio_field_confirmed_at()}>
						{formatTimestamp(record.confirmedAt)}
					</DetailItem>
					<DetailItem label={m.studio_field_unsubscribed_at()}>
						{formatTimestamp(record.unsubscribedAt)}
					</DetailItem>
				</dl>
			)}
			introduction={<SubscriberInvite />}
			renderActions={(record) => (
				<SubscriberActions key={record.id} subscriber={record} />
			)}
		/>
	);
}
