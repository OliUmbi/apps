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
				{feedback === "failed"
					? m.studio_subscriber_action_error()
					: feedback === "conflict"
						? m.studio_subscriber_email_conflict()
						: feedback === "corrected"
							? m.studio_subscriber_email_changed()
							: null}
			</Alert>
		</>
	);
}
