import { limits } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import type { Message } from "@oliumbi/messaging";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { getMessage, listMessages } from "../server/messages.functions";
import { Button, FormFeedback } from "./ui/index";

function MessageDetail({ id, onClose }: { id: string; onClose: () => void }) {
	const get = useServerFn(getMessage);
	const query = useQuery({
		queryKey: ["message", id],
		queryFn: () =>
			get({ data: id }) as Promise<{
				message: Message;
				attempts: DeliveryAttempt[];
			}>,
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
						<h2>{query.data?.message.subject ?? m.loading()}</h2>
					</div>
					{query.data && <StatusPill status={query.data.message.status} />}
				</header>
				<FormFeedback error={query.isError ? m.error_generic() : null} />
				<ol className="attempt-list">
					{query.data?.attempts.map((attempt) => (
						<li key={attempt.attemptNumber}>
							<span>{String(attempt.attemptNumber).padStart(2, "0")}</span>
							<div>
								<strong>{attempt.outcome ?? m.studio_status_pending()}</strong>
								<p>{formatDate(attempt.startedAt)}</p>
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

interface DeliveryAttempt {
	attemptNumber: number;
	outcome: string | null;
	detail: { code: string; message: string } | null;
	startedAt: string;
}

export function MessagesView() {
	const list = useServerFn(listMessages);
	const [selected, setSelected] = useState<string | null>(null);
	const [filter, setFilter] = useState<"all" | "failed">("all");
	const query = useInfiniteQuery({
		queryKey: ["messages"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			list({ data: { page: pageParam, size: limits.page, search: "" } }),
		getNextPageParam: (page) => page.nextPage,
	});
	if (selected)
		return <MessageDetail id={selected} onClose={() => setSelected(null)} />;

	const messages = query.data?.pages.flatMap((page) => page.items) ?? [];
	const failures = messages.filter((message) => isFailure(message.status));
	const visible = filter === "failed" ? failures : messages;
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">SYSTEM / DELIVERY</p>
					<h1>{m.studio_messages()}</h1>
				</div>
			</header>
			<div className="message-metrics">
				<Button
					className={filter === "all" ? "metric-card is-active" : "metric-card"}
					onClick={() => setFilter("all")}
				>
					<span>{String(messages.length).padStart(2, "0")}</span>
					{m.studio_message_all()}
				</Button>
				<Button
					className={
						filter === "failed"
							? "metric-card failure is-active"
							: "metric-card failure"
					}
					onClick={() => setFilter("failed")}
				>
					<span>{String(failures.length).padStart(2, "0")}</span>
					{m.studio_message_failures()}
				</Button>
			</div>
			<FormFeedback error={query.isError ? m.error_generic() : null} />
			{query.isPending && <p>{m.loading()}</p>}
			<div className="message-list">
				{visible.map((message) => (
					<Button
						key={message.id}
						className="message-row"
						onClick={() => setSelected(message.id)}
					>
						<StatusPill status={message.status} />
						<span className="message-copy">
							<strong>{message.subject}</strong>
							<small>
								{message.recipient} · {message.site}
							</small>
						</span>
						<span className="message-meta">
							{message.attemptCount} {m.studio_attempts()}
							<small>{formatDate(message.requestedAt)}</small>
						</span>
						<ArrowRight size={15} aria-hidden="true" />
					</Button>
				))}
			</div>
			{visible.length === 0 && !query.isPending && <p>{m.empty()}</p>}
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

function StatusPill({ status }: { status: string }) {
	return (
		<span className={isFailure(status) ? "status-pill failure" : "status-pill"}>
			{status}
		</span>
	);
}

function isFailure(status: string): boolean {
	return /fail|error|dead|reject/i.test(status);
}

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("de-CH", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
