import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { formatTimestamp } from "../model/dates";
import { getCampaign } from "../server/content/zelglihof/campaign.functions";
import { sendCampaign } from "../server/newsletter.functions";
import { campaignSendFeedback } from "../server/outcomes";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/dialog";

export function CampaignSend({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const send = useServerFn(sendCampaign);
	const cache = useQueryClient();
	// R04: a send names one exact saved version of the draft. The confirmation
	// reads the saved row (never the editor buffer) and sends its updatedAt
	// token, so what the dialog describes is exactly what gets queued.
	const draft = useQuery({
		queryKey: ["content", "zelglihof.campaign", "send-draft", id],
		queryFn: () => getCampaign({ data: { id } }),
		enabled: open,
	});
	const saved = draft.data ?? null;
	const mutation = useMutation({
		mutationFn: () => {
			if (!saved) throw new Error("A saved draft is required");
			return send({ data: { id, updatedAt: saved.updatedAt } });
		},
		onSuccess: async (result) => {
			// A stale-draft refusal queued nothing: the dialog stays open with its
			// reload/re-save action instead of closing like a queued run.
			if (result.outcome !== "queued") return;
			await cache.invalidateQueries({
				queryKey: ["content", "zelglihof.campaign"],
			});
			setOpen(false);
		},
	});
	const feedback = campaignSendFeedback({
		failed: mutation.isError,
		result: mutation.data,
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
				description={
					<>
						{m.studio_campaign_send_confirmation_description()}
						{saved ? (
							<span>
								{" "}
								{m.studio_campaign_send_version({
									savedAt: formatTimestamp(saved.updatedAt),
								})}
							</span>
						) : null}
					</>
				}
				feedback={
					<>
						<Alert tone="error">
							{feedback === "stale-draft"
								? m.studio_campaign_send_stale()
								: feedback === "failed"
									? m.studio_campaign_send_error()
									: null}
						</Alert>
						{feedback === "stale-draft" ? (
							<Button
								onClick={() => {
									mutation.reset();
									draft.refetch();
								}}
								disabled={mutation.isPending}
							>
								{m.studio_campaign_send_reload()}
							</Button>
						) : null}
					</>
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
							disabled={mutation.isPending || !saved}
						>
							{m.studio_campaign_send_now()}
						</Button>
					</>
				}
			/>
		</>
	);
}
