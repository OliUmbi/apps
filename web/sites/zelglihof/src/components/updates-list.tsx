import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { UpdateSummary } from "../model/content";
import { AssetImage } from "./asset-image";
export function UpdatesList({ updates }: { updates: UpdateSummary[] }) {
	if (updates.length === 0) return null;
	return (
		<section className="shell grid gap-7 pb-24">
			{updates.map((update, index) => (
				<article
					key={update.slug}
					className="group grid overflow-hidden rounded-[2rem] bg-cream md:grid-cols-[1.05fr_0.95fr]"
				>
					<Link
						to="/latest/$slug"
						params={{ slug: update.slug }}
						className={`relative overflow-hidden ${index === 0 ? "min-h-[28rem]" : "min-h-[22rem]"}`}
					>
						<AssetImage
							src={update.image}
							alt=""
							sizes="(min-width: 768px) 52vw, 100vw"
							className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
						/>
					</Link>
					<div className="flex flex-col justify-between p-7 md:p-10">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
								{update.category} · {update.date}
							</p>
							<h2 className="mt-4 font-serif text-4xl font-bold leading-tight md:text-5xl">
								<Link to="/latest/$slug" params={{ slug: update.slug }}>
									{update.title}
								</Link>
							</h2>
							<p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/60">
								{update.description}
							</p>
						</div>
						<Link
							to="/latest/$slug"
							params={{ slug: update.slug }}
							className="mt-10 inline-flex items-center gap-2 font-bold"
						>
							{m.zelglihof_updates_read_article()}{" "}
							<ArrowRight
								size={18}
								className="transition-transform group-hover:translate-x-1"
							/>
						</Link>
					</div>
				</article>
			))}
		</section>
	);
}
