import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { Update } from "../model/content";
import { AssetImage } from "./asset-image";

export function UpdateArticle({ update }: { update: Update }) {
	return (
		<article>
			<header className="shell py-12 md:py-20">
				<Link
					to="/latest"
					className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink"
				>
					<ArrowLeft size={17} aria-hidden="true" />
					{m.zelglihof_article_all_updates()}
				</Link>
				<p className="mt-12 text-xs font-bold uppercase tracking-[0.14em] text-clay">
					{m.zelglihof_updates_category()} ·{" "}
					<time dateTime={update.dateIso}>{update.date}</time>
				</p>
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 max-w-5xl text-6xl md:text-8xl">
					{update.title}
				</h1>
				<p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink/60">
					{update.description}
				</p>
			</header>
			<div className="shell">
				<AssetImage
					src={update.image}
					alt=""
					className="max-h-[44rem] w-full rounded-[2rem] object-cover"
				/>
			</div>
			<div className="shell grid gap-10 py-16 md:grid-cols-[0.7fr_1.3fr] md:py-24">
				<div className="max-w-2xl text-lg leading-relaxed text-ink/70 md:col-start-2">
					<SimpleMarkdown value={update.body} className="farm-markdown" />
					<div className="mt-12 rounded-[1.75rem] bg-sage/45 p-8 md:p-10">
						<p className="eyebrow text-moss">
							{m.zelglihof_article_newsletter_eyebrow()}
						</p>
						<h2 className="mt-5 font-serif text-4xl font-bold">
							{m.zelglihof_article_newsletter_title()}
						</h2>
						<p className="mt-4 text-base leading-relaxed text-ink/70">
							{m.zelglihof_article_newsletter_body()}
						</p>
					</div>
				</div>
			</div>
			{update.images.length > 0 && (
				<div className="shell grid gap-6 pb-20 md:grid-cols-2">
					{update.images.map((image) => (
						<figure key={image.id}>
							<AssetImage
								src={image.src}
								alt={image.description}
								className="w-full rounded-3xl"
							/>
							<figcaption className="mt-3 text-sm text-ink/60">
								{image.description}
							</figcaption>
						</figure>
					))}
				</div>
			)}
		</article>
	);
}
