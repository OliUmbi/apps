import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { MailCheck } from "lucide-react";
import { SubscriberEmailForm } from "./newsletter/subscriber-email-form";
import { SubscriberStatusActions } from "./newsletter/subscriber-status-actions";
import { Panel } from "./ui/panel";

export function SubscriberActions({ subscriber }: { subscriber: Subscriber }) {
	return (
		<Panel
			className="mt-1"
			icon={MailCheck}
			title={m.studio_subscriber_change_email_title()}
			description={m.studio_subscriber_change_email_description()}
		>
			<SubscriberEmailForm subscriber={subscriber} />
			<SubscriberStatusActions key={subscriber.email} subscriber={subscriber} />
		</Panel>
	);
}
