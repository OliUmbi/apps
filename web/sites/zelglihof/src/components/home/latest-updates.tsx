import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { UpdateSummary } from "../../model/content";
import { AssetImage } from "../asset-image";
import { UpdatesEmptyState } from "../updates-empty-state";
export function LatestUpdates({ updates }: { updates: UpdateSummary[] }) {
	return (
		<section id="aktuell" className="shell py-24 md:py-32">
			<div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
				<div>
					<p className="eyebrow text-clay">
						{m.zelglihof_home_updates_eyebrow()}
					</p>
					<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 text-5xl md:text-6xl">
						{m.zelglihof_home_updates_title()}
					</h2>
				</div>
				<div className="lg:pl-20">
					<p className="max-w-xl text-lg leading-relaxed text-ink/65">
						{m.zelglihof_home_updates_description()}
					</p>
					<Link
						to="/latest"
						className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-bold"
					>
						{m.zelglihof_home_all_updates()}
						<ArrowRight size={16} aria-hidden="true" />
					</Link>
				</div>
			</div>
			<div className="mt-12 grid gap-5 md:grid-cols-3">
				{updates.length === 0 ? (
					<div className="md:col-span-3">
						<UpdatesEmptyState size="sm" />
					</div>
				) : null}
				{updates.map((update, index) => (
					<Link
						key={update.slug}
						to="/latest/$slug"
						params={{ slug: update.slug }}
						className={`group overflow-hidden rounded-[1.5rem] bg-cream ${index === 0 ? "md:col-span-2" : ""}`}
					>
						<div
							className={`overflow-hidden ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}
						>
							<AssetImage
								src={update.image}
								alt=""
								sizes={
									index === 0
										? "(min-width: 768px) 66vw, 100vw"
										: "(min-width: 768px) 33vw, 100vw"
								}
								className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
							/>
						</div>
						<div className="p-6">
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
								{m.zelglihof_updates_category()} ·{" "}
								<time dateTime={update.dateIso}>{update.date}</time>
							</p>
							<h3 className="mt-3 font-serif text-2xl font-bold leading-tight">
								{update.title}
							</h3>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
