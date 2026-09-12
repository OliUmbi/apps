import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AssetImage } from "../components/ui/asset-image";
import type { Update } from "../content/site-content";

export function UpdatePage({ update }: { update: Update }) {
	if (!update)
		return (
			<section className="shell py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_update_page_paragraph()}
				</p>
				<h1 className="display-title mt-5 text-6xl">
					{m.zelglihof_pages_update_page_heading()}
				</h1>
				<Link to="/latest" className="button-primary mt-8">
					{m.zelglihof_pages_update_page_text()}
				</Link>
			</section>
		);
	return (
		<article>
			<header className="shell py-12 md:py-20">
				<Link
					to="/latest"
					className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink"
				>
					<ArrowLeft size={17} />
					{m.zelglihof_pages_update_page_text_2()}
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
						{m.zelglihof_pages_update_page_paragraph_2()}
					</p>
				</aside>
				<div className="max-w-2xl text-lg leading-relaxed text-ink/70">
					<SimpleMarkdown value={update.body} className="farm-markdown" />
					<hr className="my-10 border-forest/15" />
					<h2 className="font-serif text-4xl font-bold">
						{m.zelglihof_pages_update_page_heading_2()}
					</h2>
					<p>{m.zelglihof_pages_update_page_paragraph_3()}</p>
				</div>
			</div>
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
		</article>
	);
}
