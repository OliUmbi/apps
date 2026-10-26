import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { formatTimestamp } from "../../model/dates";
import { getMessage } from "../../server/messages.functions";
import { Alert } from "../ui/alert";
import { AttemptRow } from "../ui/attempt-row";
import { Button } from "../ui/button";
import { ListShell } from "../ui/list";
import { Panel } from "../ui/panel";
import { MessageStatus } from "./message-status";

export function MessageDetail({
	id,
	onClose,
}: {
	id: string;
	onClose: () => void;
}) {
	const get = useServerFn(getMessage);
	const query = useQuery({
		queryKey: ["message", id],
		queryFn: () => get({ data: id }),
	});
	return (
		<div className="grid gap-6 w-full">
			<Button variant="ghost" onClick={onClose}>
				<ArrowLeft size={15} aria-hidden="true" />
				{m.studio_messages()}
			</Button>
			<Panel
				title={query.data?.message.subject ?? m.message()}
				description={m.studio_delivery_attempts()}
				aside={
					query.data ? (
						<MessageStatus status={query.data.message.status} />
					) : null
				}
			>
				{query.isPending && <p role="status">{m.loading()}</p>}
				<Alert>{query.isError ? m.error_generic() : null}</Alert>
				<ListShell as="ol">
					{query.data?.attempts.map((attempt) => (
						<AttemptRow
							key={attempt.attemptNumber}
							index={String(attempt.attemptNumber).padStart(2, "0")}
							outcome={attempt.outcome ?? m.studio_status_pending()}
							timestamp={formatTimestamp(attempt.startedAt)}
							error={
								attempt.detail
									? `${attempt.detail.code}: ${attempt.detail.message}`
									: undefined
							}
						/>
					))}
				</ListShell>
			</Panel>
		</div>
	);
}
