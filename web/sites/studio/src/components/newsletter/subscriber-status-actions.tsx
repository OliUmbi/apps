import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	requestSubscriberConfirmation,
	unsubscribeSubscriber,
} from "../../server/newsletter.functions";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";

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
			<div className="mt-4 flex flex-wrap gap-2 border-t border-line-subtle pt-4">
				{subscriber.status === "active" && (
					<Button
						variant="secondary"
						disabled={action.isPending}
						onClick={() => action.mutate("unsubscribe")}
					>
						{m.studio_subscriber_unsubscribe()}
					</Button>
				)}
				{subscriber.status === "pending" && (
					<Button
						variant="secondary"
						disabled={action.isPending}
						onClick={() => action.mutate("confirm")}
					>
						{m.studio_subscriber_send_confirmation()}
					</Button>
				)}
			</div>
			<Alert tone={action.isError ? "error" : "success"}>
				{action.isError ? m.studio_subscriber_action_error() : success}
			</Alert>
		</>
	);
}
