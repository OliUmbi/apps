import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	requestSubscriberConfirmation,
	unsubscribeSubscriber,
} from "../../server/newsletter.functions";

export function SubscriberStatusActions({
	subscriber,
}: {
	subscriber: Subscriber;
}) {
	const cache = useQueryClient();
	const unsubscribe = useServerFn(unsubscribeSubscriber);
	const requestConfirmation = useServerFn(requestSubscriberConfirmation);
	const action = useMutation({
		mutationFn: async (type: "unsubscribe" | "confirm") => {
			if (type === "unsubscribe") {
				await unsubscribe({ data: { id: subscriber.id } });
				return;
			}
			await requestConfirmation({ data: { email: subscriber.email } });
		},
		onSuccess: () =>
			cache.invalidateQueries({
				queryKey: ["content", "zelglihof.subscriber"],
			}),
	});
	let success: string | null = null;
	if (action.isSuccess) {
		success =
			action.variables === "unsubscribe"
				? m.studio_subscriber_unsubscribed()
				: m.studio_subscriber_confirmation_requested();
	}
	return (
		<>
			<div className="subscriber-actions-row">
				{subscriber.status === "active" && (
					<Button
						className="button"
						disabled={action.isPending}
						onClick={() => action.mutate("unsubscribe")}
					>
						{m.studio_subscriber_unsubscribe()}
					</Button>
				)}
				{subscriber.status === "pending" && (
					<Button
						className="button"
						disabled={action.isPending}
						onClick={() => action.mutate("confirm")}
					>
						{m.studio_subscriber_send_confirmation()}
					</Button>
				)}
			</div>
			<FormFeedback
				error={action.isError ? m.studio_subscriber_action_error() : null}
				success={success}
			/>
		</>
	);
}
