import { m } from "@oliumbi/i18n/messages";

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
			className="block h-11 w-16 rounded-md object-cover"
		/>
	) : null;
}
