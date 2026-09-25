import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { sendCampaign } from "../server/newsletter.functions";

export function CampaignSend({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const send = useServerFn(sendCampaign);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: () => send({ data: { id } }),
		onSuccess: async () => {
			await cache.invalidateQueries({
				queryKey: ["content", "zelglihof.campaign"],
			});
			setOpen(false);
		},
	});
	return (
		<AlertDialog.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (mutation.isPending) return;
				if (nextOpen) mutation.reset();
				setOpen(nextOpen);
			}}
		>
			<AlertDialog.Trigger className="button primary">
				{m.studio_campaign_send()}
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-60 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-zinc-900 p-6 text-white">
					<AlertDialog.Title className="text-xl">
						{m.studio_campaign_send_confirmation_title()}
					</AlertDialog.Title>
					<AlertDialog.Description className="my-4 text-zinc-400">
						{m.studio_campaign_send_confirmation_description()}
					</AlertDialog.Description>
					<FormFeedback
						error={mutation.isError ? m.studio_campaign_send_error() : null}
					/>
					<div className="flex justify-end gap-3">
						<Button
							className="button"
							onClick={() => setOpen(false)}
							disabled={mutation.isPending}
						>
							{m.cancel()}
						</Button>
						<Button
							className="button primary"
							onClick={() => mutation.mutate()}
							disabled={mutation.isPending}
						>
							{m.studio_campaign_send_now()}
						</Button>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
