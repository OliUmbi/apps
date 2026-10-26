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
		<div className="grid grid-cols-2 gap-3">
			<div className="w-full max-w-55">
				<FilterChip selected={filter === "all"} onClick={() => onChange("all")}>
					{m.studio_messages_filter_all()}
				</FilterChip>
			</div>
			<div className="w-full max-w-55">
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
