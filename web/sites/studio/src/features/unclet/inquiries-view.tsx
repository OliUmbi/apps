import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Inbox, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { changeInquiryStatus } from "./inquiries.functions";
import type { InquiryStatus, UncleTInquiry } from "./inquiries.server";

const labels: Record<InquiryStatus, string> = {
	new: "Neu",
	contacted: "Kontaktiert",
	quoted: "Offerte",
	confirmed: "Bestätigt",
	closed: "Abgeschlossen",
	declined: "Abgelehnt",
};

export function InquiriesView({
	inquiries,
}: Readonly<{ inquiries: UncleTInquiry[] }>) {
	const router = useRouter();
	const action = useServerFn(changeInquiryStatus);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("open");
	const [busy, setBusy] = useState<string>();
	const [notice, setNotice] = useState("");
	const visible = useMemo(
		() =>
			inquiries.filter((item) => {
				const matches =
					`${item.customerName} ${item.email ?? ""} ${item.phone ?? ""} ${item.location}`
						.toLowerCase()
						.includes(search.toLowerCase());
				const stateMatches =
					status === "all" ||
					(status === "open"
						? ["new", "contacted", "quoted"].includes(item.status)
						: item.status === status);
				return matches && stateMatches;
			}),
		[inquiries, search, status],
	);

	async function change(id: string, next: InquiryStatus) {
		setBusy(id);
		setNotice("");
		try {
			await action({
				data: { action: "unclet-inquiry-status", id, status: next },
			});
			setNotice("Status gespeichert.");
			await router.invalidate();
		} catch {
			setNotice("Die Änderung konnte nicht gespeichert werden.");
		} finally {
			setBusy(undefined);
		}
	}

	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">Uncle-T · Verkauf</p>
					<h1>Anfragen</h1>
					<p>
						Vom ersten Kontakt bis zum bestätigten Anlass – mit genau den
						Angaben, die für das Gespräch nötig sind.
					</p>
				</div>
			</header>
			{notice ? (
				<div className="notice" role="status">
					{notice}
				</div>
			) : null}
			<div className="metric-grid three">
				<Metric
					label="Neu"
					value={inquiries.filter((i) => i.status === "new").length}
				/>
				<Metric
					label="In Bearbeitung"
					value={
						inquiries.filter((i) => ["contacted", "quoted"].includes(i.status))
							.length
					}
				/>
				<Metric
					label="Bestätigt"
					value={inquiries.filter((i) => i.status === "confirmed").length}
				/>
			</div>
			<section className="panel">
				<div className="panel-header responsive">
					<div>
						<h2>Eingänge</h2>
						<p>
							{visible.length} von {inquiries.length} Anfragen
						</p>
					</div>
					<div className="table-tools">
						<label className="search-field">
							<Search size={14} />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Name, Ort, Kontakt"
							/>
						</label>
						<select value={status} onChange={(e) => setStatus(e.target.value)}>
							<option value="open">Offen</option>
							<option value="all">Alle</option>
							{Object.entries(labels).map(([value, label]) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="inquiry-list">
					{visible.map((item) => (
						<article className="inquiry-row" key={item.id}>
							<div className="inquiry-main">
								<div className="inquiry-title">
									<strong>{item.customerName}</strong>
									<span className={`status-pill ${item.status}`}>
										<i />
										{labels[item.status]}
									</span>
								</div>
								<p>{item.note || "Keine weiteren Angaben."}</p>
								<div className="inquiry-meta">
									<span>
										<CalendarDays size={12} />
										{item.eventDate
											? new Date(
													`${item.eventDate}T12:00:00`,
												).toLocaleDateString("de-CH")
											: "Datum offen"}
									</span>
									<span>{item.location}</span>
									<span>{item.guestCount} Gäste</span>
									<span>
										{new Date(item.createdAt).toLocaleDateString("de-CH")}
									</span>
								</div>
							</div>
							<div className="inquiry-contact">
								{item.email ? (
									<a href={`mailto:${item.email}`}>{item.email}</a>
								) : null}
								{item.phone ? (
									<a href={`tel:${item.phone}`}>{item.phone}</a>
								) : null}
								<select
									aria-label={`Status von ${item.customerName}`}
									value={item.status}
									disabled={busy === item.id}
									onChange={(e) =>
										void change(item.id, e.target.value as InquiryStatus)
									}
								>
									{Object.entries(labels).map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
							</div>
						</article>
					))}
					{visible.length === 0 ? (
						<div className="empty-state">
							<Inbox size={20} />
							<p>Keine passenden Anfragen.</p>
						</div>
					) : null}
				</div>
			</section>
		</div>
	);
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
	return (
		<div className="metric-card">
			<span>{label}</span>
			<strong>{value}</strong>
			<small>Anfragen</small>
		</div>
	);
}
