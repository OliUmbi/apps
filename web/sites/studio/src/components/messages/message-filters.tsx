import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import type { MessageFilter } from "../../model/messages";

export function MessageFilters({
	filter,
	onChange,
}: {
	filter: MessageFilter;
	onChange: (filter: MessageFilter) => void;
}) {
	return (
		<div className="grid grid-cols-[repeat(2,minmax(0,220px))] gap-3 max-[767px]:grid-cols-2">
			<Button
				className={
					filter === "all" ? "message-filter is-active" : "message-filter"
				}
				onClick={() => onChange("all")}
				aria-pressed={filter === "all"}
			>
				{m.studio_messages_filter_all()}
			</Button>
			<Button
				className={
					filter === "failed"
						? "message-filter failure is-active"
						: "message-filter failure"
				}
				onClick={() => onChange("failed")}
				aria-pressed={filter === "failed"}
			>
				{m.studio_messages_filter_failed()}
			</Button>
		</div>
	);
}
