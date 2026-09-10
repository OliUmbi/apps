import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { sendCampaign } from "../server/newsletter.functions";
import { AlertDialog, Button, FormFeedback } from "./ui";
export function CampaignSend({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const send = useServerFn(sendCampaign);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: () => send({ data: { id } }),
		onSuccess: async () => {
			await cache.invalidateQueries({
				queryKey: ["records", "zelglihof.campaign"],
			});
			setOpen(false);
		},
	});
	return (
		<AlertDialog.Root open={open} onOpenChange={setOpen}>
			<AlertDialog.Trigger className="button primary">
				{m.studio_components_campaign_send_text()}
			</AlertDialog.Trigger>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-60 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-zinc-900 p-6 text-white">
					<AlertDialog.Title className="text-xl">
						{m.studio_components_campaign_send_text_2()}
					</AlertDialog.Title>
					<AlertDialog.Description className="my-4 text-zinc-400">
						{m.studio_components_campaign_send_text_3()}
					</AlertDialog.Description>
					<FormFeedback
						error={
							mutation.isError
								? m.studio_components_campaign_send_feedback()
								: null
						}
					/>
					<div className="flex justify-end gap-3">
						<Button
							className="button"
							onClick={() => setOpen(false)}
							disabled={mutation.isPending}
						>
							{m.studio_components_campaign_send_text_4()}
						</Button>
						<Button
							className="button primary"
							onClick={() => mutation.mutate()}
							disabled={mutation.isPending}
						>
							{m.studio_components_campaign_send_text_5()}
						</Button>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
