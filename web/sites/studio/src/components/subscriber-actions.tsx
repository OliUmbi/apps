import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { MailCheck } from "lucide-react";
import { SubscriberEmailForm } from "./newsletter/subscriber-email-form";
import { SubscriberStatusActions } from "./newsletter/subscriber-status-actions";

export function SubscriberActions({ subscriber }: { subscriber: Subscriber }) {
	return (
		<section className="settings-panel subscriber-workspace">
			<header>
				<MailCheck size={19} />
				<div>
					<h2>{m.studio_subscriber_change_email_title()}</h2>
					<p>{m.studio_subscriber_change_email_description()}</p>
				</div>
			</header>
			<SubscriberEmailForm subscriber={subscriber} />
			<SubscriberStatusActions key={subscriber.email} subscriber={subscriber} />
		</section>
	);
}
