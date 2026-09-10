import { limits } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMessage, listMessages } from "../server/messages.functions";
import { Button, Dialog, FormFeedback } from "./ui/index";

function MessageDetail({ id, onClose }: { id: string; onClose: () => void }) {
	const get = useServerFn(getMessage);
	const query = useQuery({
		queryKey: ["message", id],
		queryFn: () => get({ data: id }),
	});
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-60 max-h-[85vh] w-[min(95vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-zinc-900 p-6 text-white">
					<Dialog.Title>
						{query.data?.message.subject ?? m.loading()}
					</Dialog.Title>
					<Dialog.Description>
						{m.studio_delivery_attempts()}
					</Dialog.Description>
					<FormFeedback error={query.isError ? m.error_generic() : null} />
					<ol className="my-6 grid gap-3">
						{query.data?.attempts.map((attempt) => (
							<li
								key={attempt.attemptNumber}
								className="border-t border-white/20 pt-3"
							>
								<p>
									{attempt.attemptNumber} · {attempt.outcome} ·{" "}
									{new Date(attempt.startedAt).toLocaleString()}
								</p>
								{attempt.detail && (
									<p>
										{attempt.detail.code}: {attempt.detail.message}
									</p>
								)}
							</li>
						))}
					</ol>
					<Button className="button" onClick={onClose}>
						{m.cancel()}
					</Button>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export function MessagesView() {
	const list = useServerFn(listMessages);
	const [selected, setSelected] = useState<string | null>(null);
	const query = useInfiniteQuery({
		queryKey: ["messages"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({ data: { page: pageParam, size: limits.page, search: "" } }),
		getNextPageParam: (page) => page.nextPage,
	});
	return (
		<div className="content-stack">
			<header className="page-heading">
				<h1>{m.studio_messages()}</h1>
			</header>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p>{m.loading()}</p>}
			{query.data?.pages
				.flatMap((page) => page.items)
				.map((message) => (
					<Button
						key={message.id}
						className="panel grid gap-2 p-5 text-left"
						onClick={() => setSelected(message.id)}
					>
						<strong>{message.subject}</strong>
						<span>
							{message.recipient} · {message.site}
						</span>
						<span>
							{message.status} ·{" "}
							{new Date(message.requestedAt).toLocaleString()}
						</span>
					</Button>
				))}
			{query.data?.pages[0]?.items.length === 0 && <p>{m.empty()}</p>}
			{query.hasNextPage && (
				<Button
					className="button"
					disabled={query.isFetchingNextPage}
					onClick={() => void query.fetchNextPage()}
				>
					{m.load_more()}
				</Button>
			)}
			{selected && (
				<MessageDetail id={selected} onClose={() => setSelected(null)} />
			)}
		</div>
	);
}
