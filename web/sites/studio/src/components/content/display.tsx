import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";

const dateFormatter = new Intl.DateTimeFormat("de-CH", {
	dateStyle: "medium",
	timeZone: "Europe/Zurich",
});
const timestampFormatter = new Intl.DateTimeFormat("de-CH", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "Europe/Zurich",
});

export function displayDate(value: string | null) {
	return value ? dateFormatter.format(new Date(`${value}T12:00:00Z`)) : "—";
}

export function displayTimestamp(value: string | null) {
	return value ? timestampFormatter.format(new Date(value)) : "—";
}

export function displayStatus(value: string) {
	const labels: Record<string, () => string> = {
		new: m.studio_status_new,
		"in-progress": m.studio_status_in_progress,
		completed: m.studio_status_completed,
		cancelled: m.studio_status_cancelled,
		draft: m.studio_status_draft,
		queued: m.studio_status_queued,
		pending: m.studio_status_pending,
		active: m.studio_status_active,
		unsubscribed: m.studio_status_unsubscribed,
	};
	return labels[value]?.() ?? value;
}

export function DetailItem({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div>
			<dt>{label}</dt>
			<dd>{children ?? "—"}</dd>
		</div>
	);
}

export function ImageThumbnail({
	site,
	id,
}: {
	site: string;
	id: string | null;
}) {
	return id ? (
		<img
			src={`/api/assets/${encodeURIComponent(id)}?site=${encodeURIComponent(site)}&size=xs`}
			alt=""
			loading="lazy"
			className="table-thumbnail"
		/>
	) : null;
}
