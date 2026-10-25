import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { sendCampaign } from "../server/newsletter.functions";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/dialog";

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
		<>
			<Button
				variant="primary"
				onClick={() => {
					mutation.reset();
					setOpen(true);
				}}
			>
				{m.studio_campaign_send()}
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (mutation.isPending) return;
					if (nextOpen) mutation.reset();
					setOpen(nextOpen);
				}}
				title={m.studio_campaign_send_confirmation_title()}
				description={m.studio_campaign_send_confirmation_description()}
				feedback={
					<Alert tone="error">
						{mutation.isError ? m.studio_campaign_send_error() : null}
					</Alert>
				}
				actions={
					<>
						<Button
							onClick={() => setOpen(false)}
							disabled={mutation.isPending}
						>
							{m.cancel()}
						</Button>
						<Button
							variant="primary"
							onClick={() => mutation.mutate()}
							disabled={mutation.isPending}
						>
							{m.studio_campaign_send_now()}
						</Button>
					</>
				}
			/>
		</>
	);
}
