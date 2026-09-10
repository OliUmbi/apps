import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	correctSubscriberEmail,
	requestSubscriberConfirmation,
	unsubscribeSubscriber,
} from "../server/newsletter.functions";
import { Button, Dialog, Form, FormFeedback, InputField } from "./ui";
export function SubscriberActions({ record }: { record: ResourceRecord }) {
	const [open, setOpen] = useState(false);
	const cache = useQueryClient();
	const correct = useServerFn(correctSubscriberEmail),
		unsubscribe = useServerFn(unsubscribeSubscriber),
		resend = useServerFn(requestSubscriberConfirmation);
	const refresh = async () => {
		await cache.invalidateQueries({
			queryKey: ["records", "zelglihof.subscriber"],
		});
		setOpen(false);
	};
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
		<div className="flex flex-wrap gap-2">
			<Button className="button" onClick={() => setOpen(true)}>
				{m.studio_components_subscriber_actions_text()}
			</Button>
			{record.status === "active" && (
				<Button
					className="button"
					disabled={removal.isPending}
					onClick={() => removal.mutate()}
				>
					{m.studio_components_subscriber_actions_text_2()}
				</Button>
			)}
			{record.status === "pending" && (
				<Button
					className="button"
					disabled={confirmation.isPending}
					onClick={() => confirmation.mutate()}
				>
					{m.studio_components_subscriber_actions_text_3()}
				</Button>
			)}
			<FormFeedback
				error={
					removal.isError || confirmation.isError
						? m.studio_components_subscriber_actions_feedback()
						: null
				}
				success={
					confirmation.isSuccess
						? m.studio_components_subscriber_actions_feedback_2()
						: null
				}
			/>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
					<Dialog.Popup className="fixed left-1/2 top-1/2 z-60 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-zinc-900 p-6 text-white">
						<Dialog.Title className="mb-4 text-xl">
							{m.studio_components_subscriber_actions_text_4()}
						</Dialog.Title>
						<Dialog.Description className="mb-5 text-sm text-zinc-400">
							{m.studio_components_subscriber_actions_text_5()}
						</Dialog.Description>
						<Form
							className="grid gap-5"
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
							<FormFeedback
								error={
									correction.isError
										? m.studio_components_subscriber_actions_feedback_3()
										: null
								}
							/>
							<div className="flex gap-3">
								<Button className="button" onClick={() => setOpen(false)}>
									{m.studio_components_subscriber_actions_text_6()}
								</Button>
								<Button
									type="submit"
									className="button primary"
									disabled={correction.isPending}
								>
									{m.studio_components_subscriber_actions_text_7()}
								</Button>
							</div>
						</Form>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
