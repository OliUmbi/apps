import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MailCheck } from "lucide-react";
import {
	correctSubscriberEmail,
	requestSubscriberConfirmation,
	unsubscribeSubscriber,
} from "../server/newsletter.functions";
import { Button, Form, FormFeedback, InputField } from "./ui";

export function SubscriberActions({ record }: { record: ResourceRecord }) {
	const cache = useQueryClient();
	const correct = useServerFn(correctSubscriberEmail);
	const unsubscribe = useServerFn(unsubscribeSubscriber);
	const resend = useServerFn(requestSubscriberConfirmation);
	const refresh = () =>
		cache.invalidateQueries({ queryKey: ["records", "zelglihof.subscriber"] });
	const correction = useMutation({
		mutationFn: (email: string) =>
			correct({ data: { id: String(record.id), email } }),
		onSuccess: refresh,
	});
	const removal = useMutation({
		mutationFn: () => unsubscribe({ data: { id: String(record.id) } }),
		onSuccess: refresh,
	});
	const confirmation = useMutation({
		mutationFn: () => resend({ data: { email: String(record.email) } }),
	});
	return (
		<section className="settings-panel subscriber-workspace">
			<header>
				<MailCheck size={19} />
				<div>
					<h2>{m.studio_components_subscriber_actions_text_4()}</h2>
					<p>{m.studio_components_subscriber_actions_text_5()}</p>
				</div>
			</header>
			<Form
				className="subscriber-email-form"
				onSubmit={(event) => {
					event.preventDefault();
					correction.mutate(
						String(new FormData(event.currentTarget).get("email")),
					);
				}}
			>
				<InputField
					name="email"
					label={m.studio_components_subscriber_actions_label()}
					type="email"
					defaultValue={String(record.email)}
					required
				/>
				<Button
					type="submit"
					className="button"
					disabled={correction.isPending}
				>
					{m.studio_components_subscriber_actions_text_7()}
				</Button>
			</Form>
			<div className="subscriber-actions-row">
				{record.status === "active" ? (
					<Button
						className="button"
						disabled={removal.isPending}
						onClick={() => removal.mutate()}
					>
						{m.studio_components_subscriber_actions_text_2()}
					</Button>
				) : null}
				{record.status === "pending" ? (
					<Button
						className="button"
						disabled={confirmation.isPending}
						onClick={() => confirmation.mutate()}
					>
						{m.studio_components_subscriber_actions_text_3()}
					</Button>
				) : null}
			</div>
			<FormFeedback
				error={
					correction.isError || removal.isError || confirmation.isError
						? m.studio_components_subscriber_actions_feedback()
						: null
				}
				success={
					correction.isSuccess
						? m.studio_components_subscriber_actions_feedback_3()
						: confirmation.isSuccess
							? m.studio_components_subscriber_actions_feedback_2()
							: null
				}
			/>
		</section>
	);
}
