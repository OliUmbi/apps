import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sprout } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import { AssetImage } from "../components/ui/asset-image";
import type { Update } from "../content/site-content";

export function UpdatesPage({ updates }: { updates: Update[] }) {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_updates_page_paragraph()}
				</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						{m.zelglihof_pages_updates_page_heading()}
					</h1>
					<p className="max-w-xl text-xl leading-relaxed text-ink/60">
						{m.zelglihof_pages_updates_page_paragraph_2()}
					</p>
				</div>
			</section>
			<section className="shell grid gap-7 pb-24">
				{updates.length === 0 ? (
					<div className="updates-empty">
						<Sprout size={34} aria-hidden="true" />
						<div>
							<p className="eyebrow text-clay">
								{m.zelglihof_updates_empty_eyebrow()}
							</p>
							<h2 className="mt-3 font-serif text-4xl font-bold">
								{m.zelglihof_updates_empty_title()}
							</h2>
							<p className="mt-3 max-w-xl leading-relaxed text-ink/60">
								{m.zelglihof_updates_empty_copy()}
							</p>
						</div>
					</div>
				) : null}
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
								{m.zelglihof_pages_updates_page_text()}{" "}
								<ArrowRight
									size={18}
									className="transition-transform group-hover:translate-x-1"
								/>
							</Link>
						</div>
					</article>
				))}
			</section>
			<NewsletterSignup />
		</>
	);
}
