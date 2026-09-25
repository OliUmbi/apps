import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import type { Message } from "@oliumbi/messaging";
import { ArrowRight } from "lucide-react";
import { formatTimestamp } from "../../model/dates";
import { MessageStatus } from "./message-status";

export function MessageList({
	messages,
	onOpen,
}: {
	messages: Message[];
	onOpen: (id: string) => void;
}) {
	return (
		<div className="message-list">
			{messages.map((message) => (
				<Button
					key={message.id}
					className="message-row"
					onClick={() => onOpen(message.id)}
				>
					<MessageStatus status={message.status} />
					<span className="message-body">
						<strong>{message.subject}</strong>
						<small>
							{message.recipient} · {message.site}
						</small>
					</span>
					<span className="message-meta">
						{message.attemptCount} {m.studio_attempts()}
						<small>{formatTimestamp(message.requestedAt)}</small>
					</span>
					<ArrowRight size={15} aria-hidden="true" />
				</Button>
			))}
		</div>
	);
}
