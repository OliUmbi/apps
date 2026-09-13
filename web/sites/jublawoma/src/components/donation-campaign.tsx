import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import {
	type CommitmentInput,
	commitmentSchema,
} from "@oliumbi/jublawoma-data/contracts";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, HeartHandshake, Phone } from "lucide-react";
import { useState } from "react";
import { submitCommitment } from "../data/donations";
import { SubmissionForm } from "./submission-form";

export function DonationCampaign({
	record,
	items,
}: {
	record: ResourceRecord;
	items: ResourceRecord[];
}) {
	const router = useRouter();
	const submit = useServerFn(submitCommitment);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const availableItems = items.filter((item) => number(item.remaining) > 0);
	const selected = availableItems.find(
		(item) => String(item.id) === selectedId,
	);

	return (
		<section className="donation-campaign shell">
			<header className="donation-focus">
				<div>
					<p className="kicker">{m.jublawoma_routes_donations_paragraph()}</p>
					<h1>{record.title}</h1>
					<p className="donation-lead">{record.description}</p>
				</div>
				<div className="donation-meta">
					<span>
						<CalendarDays size={18} aria-hidden="true" />
						{dateRange(record.starts_at, record.ends_at)}
					</span>
					<span>
						<Phone size={18} aria-hidden="true" /> {record.contact}
					</span>
				</div>
			</header>
			<div className="donation-items">
				<div className="donation-items-heading">
					<HeartHandshake size={28} aria-hidden="true" />
					<div>
						<p className="kicker">{m.jublawoma_donation_items_eyebrow()}</p>
						<h2>{m.jublawoma_donation_items_title()}</h2>
					</div>
				</div>
				<div className="donation-item-list">
					{items.map((item) => (
						<DonationItem
							key={String(item.id)}
							item={item}
							selected={String(item.id) === selectedId}
							onSelect={() => setSelectedId(String(item.id))}
						/>
					))}
				</div>
				{selected ? (
					<CommitmentPanel
						key={String(selected.id)}
						record={record}
						item={selected}
						onSubmit={async (data) => {
							const result = await submit({ data });
							await router.invalidate();
							return result;
						}}
					/>
				) : availableItems.length ? (
					<p className="donation-select-help">
						{m.jublawoma_donation_select_help()}
					</p>
				) : null}
			</div>
		</section>
	);
}

function DonationItem({
	item,
	selected,
	onSelect,
}: {
	item: ResourceRecord;
	selected: boolean;
	onSelect: () => void;
}) {
	const remaining = number(item.remaining);
	const quantity = number(item.quantity);
	const progress = quantity > 0 ? ((quantity - remaining) / quantity) * 100 : 0;
	return (
		<article className={`donation-item ${selected ? "is-selected" : ""}`}>
			<div className="donation-item-copy">
				<h3>{item.name}</h3>
				{item.detail ? <p>{item.detail}</p> : null}
				<div className="donation-progress" aria-hidden="true">
					<span style={{ width: `${Math.min(100, progress)}%` }} />
				</div>
				<p className="donation-remaining">
					<strong>{remaining}</strong> von {quantity} {item.unit}{" "}
					{m.jublawoma_donation_remaining()}
				</p>
			</div>
			{remaining > 0 ? (
				<button className="button dark" type="button" onClick={onSelect}>
					{selected
						? m.jublawoma_donation_selected()
						: m.jublawoma_donation_choose()}
				</button>
			) : (
				<p className="donation-complete">{m.jublawoma_donation_complete()}</p>
			)}
		</article>
	);
}

function CommitmentPanel({
	record,
	item,
	onSubmit,
}: {
	record: ResourceRecord;
	item: ResourceRecord;
	onSubmit: (data: CommitmentInput) => Promise<{ outcome: string }>;
}) {
	const remaining = number(item.remaining);
	const step = number(item.step);
	return (
		<aside className="donation-action">
			<p className="kicker">{m.jublawoma_donation_form_eyebrow()}</p>
			<h3>{item.name}</h3>
			<SubmissionForm
				className="donation-form"
				schema={commitmentSchema}
				defaults={{ donationId: record.id, itemId: item.id }}
				submit={onSubmit}
				success={m.jublawoma_routes_donations_donationId_success()}
				submitLabel={m.jublawoma_donation_submit()}
				fields={[
					{
						name: "name",
						label: m.jublawoma_routes_donations_donationId_label(),
						required: true,
					},
					{
						name: "phone",
						label: m.jublawoma_routes_donations_donationId_label_2(),
						type: "tel",
						required: true,
					},
					{
						name: "quantity",
						label: String(item.unit),
						type: "number",
						min: step,
						max: remaining,
						step,
						required: true,
					},
					{
						name: "note",
						label: m.jublawoma_routes_donations_donationId_label_3(),
						type: "textarea",
						rows: 2,
					},
				]}
			/>
		</aside>
	);
}

function number(value: unknown): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Number(parsed.toPrecision(10)) : 0;
}

function dateRange(start: unknown, end: unknown): string {
	const format = new Intl.DateTimeFormat("de-CH", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
	const first = new Date(String(start));
	const last = new Date(String(end));
	if (Number.isNaN(first.valueOf()) || Number.isNaN(last.valueOf())) return "";
	return `${format.format(first)} – ${format.format(last)}`;
}
