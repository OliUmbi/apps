import { m } from "@oliumbi/i18n/messages";
import { Sprout } from "lucide-react";

// `size="sm"` is the compact variant the home page embeds in its grid.
export function UpdatesEmptyState({ size = "lg" }: { size?: "sm" | "lg" }) {
	const small = size === "sm";
	return (
		<div className="updates-empty">
			<Sprout size={34} aria-hidden="true" />
			<div>
				<p className="eyebrow text-clay">
					{m.zelglihof_updates_empty_eyebrow()}
				</p>
				{small ? (
					<h3 className="mt-3 font-serif text-3xl font-bold">
						{m.zelglihof_updates_empty_title()}
					</h3>
				) : (
					<h2 className="mt-3 font-serif text-4xl font-bold">
						{m.zelglihof_updates_empty_title()}
					</h2>
				)}
				<p
					className={
						small
							? "mt-2 text-ink/60"
							: "mt-3 max-w-xl leading-relaxed text-ink/60"
					}
				>
					{m.zelglihof_updates_empty_body()}
				</p>
			</div>
		</div>
	);
}
