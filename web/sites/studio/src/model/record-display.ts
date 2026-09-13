import {
	type RecordValue,
	type ResourceField,
	statusValues,
} from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";

const statusLabels: Record<string, () => string> = {
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

export const editableStatuses = statusValues.map((value) => ({
	value,
	label: statusLabels[value](),
}));

export function displayRecordValue(
	field: ResourceField,
	value: RecordValue | undefined,
): string {
	if (value === null || value === undefined || value === "") return "—";
	if (typeof value === "boolean") return value ? m.yes() : m.no();
	if (field.name === "status")
		return statusLabels[String(value)]?.() ?? String(value);
	if (field.kind === "date")
		return new Intl.DateTimeFormat("de-CH").format(
			new Date(`${String(value)}T00:00:00`),
		);
	if (field.kind === "datetime-local")
		return new Intl.DateTimeFormat("de-CH", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(String(value)));
	return String(value);
}
