import { m } from "@oliumbi/i18n/messages";
import { Badge } from "../ui/badge";

const labels: Record<string, () => string> = {
	PENDING: m.studio_status_pending,
	PROCESSING: m.studio_status_processing,
	SENT: m.studio_status_sent,
	FAILED: m.studio_status_failed,
};

export function MessageStatus({ status }: { status: string }) {
	const normalized = status.toUpperCase();
	return (
		<Badge tone={normalized === "FAILED" ? "danger" : "neutral"}>
			{labels[normalized]?.() ?? status}
		</Badge>
	);
}
