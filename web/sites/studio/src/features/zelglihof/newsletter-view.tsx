import type { Subscriber } from "@oliumbi/newsletter";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Mail, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
	type NewsletterActionInput,
	performNewsletterAction,
} from "./newsletter.functions";
import type { FailedMessage } from "./newsletter.server";

export function NewsletterView({
	subscribers: allSubscribers,
	failedMessages,
}: Readonly<{ subscribers: Subscriber[]; failedMessages: FailedMessage[] }>) {
	const router = useRouter();
	const action = useServerFn(performNewsletterAction);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [notice, setNotice] = useState("");
	const [busy, setBusy] = useState<string>();
	const subscribers = useMemo(
		() =>
			allSubscribers.filter(
				(subscriber) =>
					subscriber.email.toLowerCase().includes(search.toLowerCase()) &&
					(status === "all" || subscriber.status === status),
			),
		[allSubscribers, search, status],
	);

	async function run(input: NewsletterActionInput, message: string) {
		setBusy(input.id);
		setNotice("");
		try {
			await action({ data: input });
			setNotice(message);
			await router.invalidate();
		} catch (error) {
			setNotice(
				error instanceof Error
					? error.message
					: "Die Änderung ist fehlgeschlagen.",
			);
		} finally {
			setBusy(undefined);
		}
	}

	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">Zelglihof · Kommunikation</p>
					<h1>Newsletter</h1>
					<p>
						Einwilligungen und Zustellung ohne versteckte Aktivierungen
						verwalten.
					</p>
				</div>
			</header>
			{notice ? (
				<div className="notice" role="status">
					{notice}
				</div>
			) : null}
			<div className="metric-grid three">
				<Metric label="Alle Kontakte" value={allSubscribers.length} />
				<Metric
					label="Aktiv"
					value={
						allSubscribers.filter((item) => item.status === "active").length
					}
				/>
				<Metric
					label="Ausstehend"
					value={
						allSubscribers.filter((item) => item.status === "pending").length
					}
				/>
			</div>
			<section className="panel">
				<div className="panel-header responsive">
					<div>
						<h2>Abonnenten</h2>
						<p>
							{subscribers.length} von {allSubscribers.length} Einträgen
						</p>
					</div>
					<div className="table-tools">
						<label className="search-field">
							<Search size={14} />
							<input
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="E-Mail suchen"
							/>
						</label>
						<select
							value={status}
							onChange={(event) => setStatus(event.target.value)}
						>
							<option value="all">Alle Status</option>
							<option value="pending">Ausstehend</option>
							<option value="active">Aktiv</option>
							<option value="unsubscribed">Abgemeldet</option>
						</select>
					</div>
				</div>
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Kontakt</th>
								<th>Status</th>
								<th>Einwilligung</th>
								<th className="text-right">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							{subscribers.map((subscriber) => (
								<SubscriberRow
									key={subscriber.id}
									subscriber={subscriber}
									busy={busy === subscriber.id}
									run={run}
								/>
							))}
							{subscribers.length === 0 ? (
								<tr>
									<td colSpan={4}>
										<div className="empty-state">
											<Mail size={20} />
											<p>Keine passenden Kontakte.</p>
										</div>
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</section>
			<section className="panel">
				<div className="panel-header">
					<div>
						<h2>Zustellungsfehler</h2>
						<p>
							Nachrichten, die nach mehreren Versuchen nicht zugestellt wurden.
						</p>
					</div>
					{failedMessages.length ? (
						<span className="count-badge danger">{failedMessages.length}</span>
					) : (
						<span className="count-badge">0</span>
					)}
				</div>
				{failedMessages.length === 0 ? (
					<div className="empty-state">
						<Mail size={20} />
						<p>Keine fehlgeschlagenen Zustellungen.</p>
						<small>Neue Probleme erscheinen automatisch hier.</small>
					</div>
				) : (
					<div className="module-list">
						{failedMessages.map((message) => (
							<div className="failure-row" key={message.id}>
								<span className="module-icon danger">
									<AlertTriangle size={16} />
								</span>
								<div className="min-w-0 flex-1">
									<strong>{message.recipientEmail}</strong>
									<small>
										{message.messageType} · {message.attemptCount} Versuche
									</small>
									<p>{message.lastError}</p>
								</div>
								<button
									type="button"
									className="button secondary small"
									onClick={() =>
										run(
											{ action: "retry-message", id: message.id },
											"E-Mail wird erneut versucht.",
										)
									}
								>
									<RefreshCw size={13} /> Erneut versuchen
								</button>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}

function SubscriberRow({
	subscriber,
	busy,
	run,
}: Readonly<{
	subscriber: Subscriber;
	busy: boolean;
	run: (input: NewsletterActionInput, message: string) => Promise<void>;
}>) {
	const [email, setEmail] = useState(subscriber.email);
	return (
		<tr>
			<td>
				<input
					className="inline-input"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
				/>
				<small className="cell-note">{subscriber.locale.toUpperCase()}</small>
			</td>
			<td>
				<Status value={subscriber.status} />
			</td>
			<td>
				<span>
					{new Date(subscriber.requestedAt).toLocaleDateString("de-CH")}
				</span>
				<small className="cell-note">{subscriber.consentSource}</small>
			</td>
			<td>
				<div className="row-actions">
					{email !== subscriber.email ? (
						<button
							type="button"
							disabled={busy}
							className="button secondary small"
							onClick={() =>
								run(
									{ action: "correct", id: subscriber.id, email },
									"Adresse geändert; Bestätigung versendet.",
								)
							}
						>
							Speichern
						</button>
					) : null}
					{subscriber.status === "pending" ? (
						<button
							type="button"
							disabled={busy}
							className="button secondary small"
							onClick={() =>
								run(
									{ action: "resend", id: subscriber.id },
									"Bestätigung erneut versendet.",
								)
							}
						>
							Bestätigung senden
						</button>
					) : null}
					{subscriber.status !== "unsubscribed" ? (
						<button
							type="button"
							disabled={busy}
							className="button secondary small"
							onClick={() =>
								run(
									{ action: "unsubscribe", id: subscriber.id },
									"Abonnement beendet.",
								)
							}
						>
							Abmelden
						</button>
					) : null}
					<button
						type="button"
						disabled={busy}
						className="icon-button danger"
						aria-label={`${subscriber.email} löschen`}
						onClick={() =>
							window.confirm(
								"Eintrag und zugehörige E-Mail-Daten endgültig löschen?",
							) &&
							run({ action: "delete", id: subscriber.id }, "Eintrag gelöscht.")
						}
					>
						<Trash2 size={14} />
					</button>
				</div>
			</td>
		</tr>
	);
}

function Status({ value }: Readonly<{ value: Subscriber["status"] }>) {
	const labels = {
		pending: "Ausstehend",
		active: "Aktiv",
		unsubscribed: "Abgemeldet",
	};
	return (
		<span className={`status-pill ${value}`}>
			<i /> {labels[value]}
		</span>
	);
}
function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
	return (
		<div className="metric-card">
			<span>{label}</span>
			<strong>{value}</strong>
			<small>Kontakte</small>
		</div>
	);
}
