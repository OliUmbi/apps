import { Button } from "@base-ui/react/button";
import { limits } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { MessageFilter } from "../model/messages";
import { listMessages } from "../server/messages.functions";
import { MessageDetail } from "./messages/message-detail";
import { MessageFilters } from "./messages/message-filters";
import { MessageList } from "./messages/message-list";

export function MessagesView() {
	const list = useServerFn(listMessages);
	const [selected, setSelected] = useState<string | null>(null);
	const [filter, setFilter] = useState<MessageFilter>("all");
	const query = useInfiniteQuery({
		queryKey: ["messages", filter],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({
				data: { page: pageParam, size: limits.page, search: "", filter },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	if (selected)
		return <MessageDetail id={selected} onClose={() => setSelected(null)} />;

	const messages = query.data?.pages.flatMap((page) => page.items) ?? [];
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">SYSTEM / DELIVERY</p>
					<h1>{m.studio_messages()}</h1>
				</div>
			</header>
			<MessageFilters filter={filter} onChange={setFilter} />
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p>{m.loading()}</p>}
			<MessageList messages={messages} onOpen={setSelected} />
			{messages.length === 0 && query.isSuccess && <p>{m.empty()}</p>}
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => void query.fetchNextPage()}
				>
					{m.load_more()}
				</Button>
			)}
		</div>
	);
}
