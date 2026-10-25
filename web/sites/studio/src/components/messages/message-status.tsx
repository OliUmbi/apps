import { Badge } from "../ui/badge";

export function MessageStatus({ status }: { status: string }) {
	return (
		<Badge tone={status === "FAILED" ? "danger" : "neutral"}>
			{status}
		</Badge>
	);
}
