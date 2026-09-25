import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { formatTimestamp } from "../../model/dates";
import { getMessage } from "../../server/messages.functions";
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
		<div className="content-stack workspace-page">
			<Button className="workspace-back" onClick={onClose}>
				<ArrowLeft size={15} aria-hidden="true" />
				{m.studio_messages()}
			</Button>
			<section className="message-detail">
				<header className="editor-heading">
					<div>
						<p className="page-kicker">{m.studio_delivery_attempts()}</p>
						<h2>{query.data?.message.subject ?? m.message()}</h2>
					</div>
					{query.data && <MessageStatus status={query.data.message.status} />}
				</header>
				{query.isPending && <p role="status">{m.loading()}</p>}
				<FormFeedback error={query.isError ? m.error_generic() : null} />
				<ol className="attempt-list">
					{query.data?.attempts.map((attempt) => (
						<li key={attempt.attemptNumber}>
							<span>{String(attempt.attemptNumber).padStart(2, "0")}</span>
							<div>
								<strong>{attempt.outcome ?? m.studio_status_pending()}</strong>
								<p>{formatTimestamp(attempt.startedAt)}</p>
								{attempt.detail && (
									<pre>
										{attempt.detail.code}: {attempt.detail.message}
									</pre>
								)}
							</div>
						</li>
					))}
				</ol>
			</section>
		</div>
	);
}
