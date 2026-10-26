import { m } from "@oliumbi/i18n/messages";
import type { Message } from "@oliumbi/messaging";
import { ArrowRight } from "lucide-react";
import { formatTimestamp } from "../../model/dates";
import { ListMeta, ListRow, ListShell } from "../ui/list";
import { Body, Title } from "../ui/text";
import { MessageStatus } from "./message-status";

export function MessageList({
	messages,
	onOpen,
}: {
	messages: Message[];
	onOpen: (id: string) => void;
}) {
	return (
		<ListShell>
			{messages.map((message) => (
				<ListRow
					key={message.id}
					leading={<MessageStatus status={message.status} />}
					trailing={
						<>
							<ListMeta detail={formatTimestamp(message.requestedAt)}>
								{message.attemptCount} {m.studio_attempts()}
							</ListMeta>
							<ArrowRight size={15} aria-hidden="true" />
						</>
					}
					onClick={() => onOpen(message.id)}
				>
					<Title as="h2" size="sm">
						{message.subject}
					</Title>
					<Body>
						{message.recipient} · {message.site}
					</Body>
				</ListRow>
			))}
		</ListShell>
	);
}
