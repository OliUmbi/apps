import { m } from "@oliumbi/i18n/messages";
import type { MessageFilter } from "../../model/messages";
import { FilterChip } from "../ui/filter-chip";

export function MessageFilters({
	filter,
	onChange,
}: {
	filter: MessageFilter;
	onChange: (filter: MessageFilter) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			<div>
				<FilterChip selected={filter === "all"} onClick={() => onChange("all")}>
					{m.studio_messages_filter_all()}
				</FilterChip>
			</div>
			<div>
				<FilterChip
					tone="danger"
					selected={filter === "failed"}
					onClick={() => onChange("failed")}
				>
					{m.studio_messages_filter_failed()}
				</FilterChip>
			</div>
		</div>
	);
}
