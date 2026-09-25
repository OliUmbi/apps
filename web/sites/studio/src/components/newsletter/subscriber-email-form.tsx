import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import type { Subscriber } from "@oliumbi/zelglihof-data/content/subscriber";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { correctSubscriberEmail } from "../../server/newsletter.functions";
import { InputField } from "../input-field";

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
		onSuccess: () =>
			cache.invalidateQueries({
				queryKey: ["content", "zelglihof.subscriber"],
			}),
	});
	return (
		<>
			<Form
				className="subscriber-email-form"
				onSubmit={(event) => {
					event.preventDefault();
					if (correction.isPending) return;
					const email = String(new FormData(event.currentTarget).get("email"));
					correction.mutate(email);
				}}
			>
				<InputField
					key={subscriber.email}
					name="email"
					label={m.email()}
					type="email"
					defaultValue={subscriber.email}
					disabled={correction.isPending}
					required
				/>
				<Button
					type="submit"
					className="button"
					disabled={correction.isPending}
				>
					{correction.isPending ? m.saving() : m.save()}
				</Button>
			</Form>
			<FormFeedback
				error={correction.isError ? m.studio_subscriber_action_error() : null}
				success={
					correction.isSuccess ? m.studio_subscriber_email_changed() : null
				}
			/>
		</>
	);
}
