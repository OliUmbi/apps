import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { correctSubscriberEmail } from "../../server/newsletter.functions";
import { correctionFeedback } from "../../server/outcomes";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { TextField } from "../ui/text-field";

export function SubscriberEmailForm({
	subscriber,
}: {
	subscriber: Subscriber;
}) {
	const cache = useQueryClient();
	const correctEmail = useServerFn(correctSubscriberEmail);
	const correction = useMutation({
		mutationFn: (email: string) =>
			correctEmail({ data: { id: subscriber.id, email } }),
		onSuccess: (result) =>
			// A conflict corrected nothing: only the corrected outcome changes the
			// stored record and earns a refetch.
			result.outcome === "corrected"
				? cache.invalidateQueries({
						queryKey: ["content", "zelglihof.subscriber"],
					})
				: undefined,
	});
	// A resolved correction is not automatically a success: the typed outcome
	// decides, and "conflict" is a refusal ("address already subscribed").
	const feedback = correctionFeedback({
		failed: correction.isError,
		result: correction.data,
	});
	// The outcome alone cannot describe the consequence: saving the stored
	// address changes nothing, an unsubscribed record stays unsubscribed, and
	// only a pending/active record gets a new confirmation.
	const submitted = correction.variables?.trim().toLowerCase();
	const unchanged =
		submitted !== undefined && submitted === subscriber.email.toLowerCase();
	const message =
		feedback === "failed"
			? m.studio_subscriber_action_error()
			: feedback === "conflict"
				? m.studio_subscriber_email_conflict()
				: feedback === "corrected"
					? unchanged
						? m.studio_subscriber_email_unchanged()
						: subscriber.status === "unsubscribed"
							? m.studio_subscriber_email_changed_unsubscribed()
							: m.studio_subscriber_email_changed()
					: null;
	return (
		<>
			<Form
				className="flex items-end gap-3 max-md:flex-col"
				onSubmit={(event) => {
					event.preventDefault();
					if (correction.isPending) return;
					const email = String(new FormData(event.currentTarget).get("email"));
					correction.mutate(email);
				}}
			>
				<div className="grow">
					<TextField
						key={subscriber.email}
						name="email"
						label={m.email()}
						type="email"
						defaultValue={subscriber.email}
						disabled={correction.isPending}
						required
					/>
				</div>
				<Button
					type="submit"
					variant="secondary"
					disabled={correction.isPending}
				>
					{correction.isPending ? m.saving() : m.save()}
				</Button>
			</Form>
			<Alert tone={feedback === "corrected" ? "success" : "error"}>
				{message}
			</Alert>
		</>
	);
}
