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
					<ArrowLeft size={17} />
					{m.zelglihof_article_all_updates()}
				</Link>
				<p className="mt-12 text-xs font-bold uppercase tracking-[0.14em] text-clay">
					{update.category} · {update.date}
				</p>
				<h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
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
				<aside>
					<p className="eyebrow text-moss">
						{m.zelglihof_article_newsletter_eyebrow()}
					</p>
				</aside>
				<div className="max-w-2xl text-lg leading-relaxed text-ink/70">
					<SimpleMarkdown value={update.body} className="farm-markdown" />
					<hr className="my-10 border-forest/15" />
					<h2 className="font-serif text-4xl font-bold">
						{m.zelglihof_article_newsletter_title()}
					</h2>
					<p>{m.zelglihof_article_newsletter_body()}</p>
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
