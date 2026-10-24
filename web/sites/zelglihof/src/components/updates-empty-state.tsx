import { m } from "@oliumbi/i18n/messages";
import { Sprout } from "lucide-react";
export function UpdatesEmptyState() {
	return (
		<div className="updates-empty">
			<Sprout size={34} aria-hidden="true" />
			<div>
				<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
					{m.zelglihof_updates_empty_eyebrow()}
				</p>
				<h2 className="mt-3 font-serif text-4xl font-bold">
					{m.zelglihof_updates_empty_title()}
				</h2>
				<p className="mt-3 max-w-xl leading-relaxed text-ink/60">
					{m.zelglihof_updates_empty_body()}
				</p>
			</div>
		</div>
	);
}
