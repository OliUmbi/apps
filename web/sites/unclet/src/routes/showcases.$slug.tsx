import { publicImageUrl } from "@oliumbi/assets/urls";
import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AssetImage } from "../components/asset-image";
import { ShowcaseFacts } from "../components/showcase-facts";
import { getShowcase } from "../data/showcases";

export const Route = createFileRoute("/showcases/$slug")({
	loader: async ({ params }) => {
		const result = await getShowcase({
			data: { slug: params.slug },
		});
		if (!result) throw notFound();
		return result;
	},
	component: Showcase,
});
function Showcase() {
	const { showcase: record, images } = Route.useLoaderData();
	const image = publicImageUrl;
	return (
		<article className="showcase-detail shell pb-24 pt-32 md:pb-32 md:pt-36">
			<Link
				to="/showcases"
				className="mb-12 inline-flex min-h-11 items-center gap-3 border border-brass/45 px-5 text-sm font-semibold text-brass-light transition hover:bg-brass hover:text-night"
			>
				<ArrowLeft size={17} aria-hidden="true" />
				{m.unclet_showcase_back()}
			</Link>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)] lg:gap-14 xl:gap-20">
				<div className="showcase-gallery">
					<AssetImage
						src={record.imageId ? image(record.imageId) : null}
						alt={record.title}
						sizes="(min-width: 1024px) 64vw, 100vw"
						className="showcase-cover w-full object-cover"
					/>
					{images.length ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{images.map((item) => (
								<figure key={item.imageId}>
									<AssetImage
										src={image(item.imageId)}
										alt={item.description}
										sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
										className="aspect-[4/3] w-full object-cover"
									/>
									{item.description ? (
										<figcaption className="mt-3 text-sm text-bone/45">
											{item.description}
										</figcaption>
									) : null}
								</figure>
							))}
						</div>
					) : null}
				</div>
				<aside className="showcase-copy lg:sticky lg:top-28 lg:self-start">
					<p className="eyebrow text-brass">{m.unclet_showcase_event()}</p>
					<h1 className="display-title mt-7 text-5xl md:text-6xl xl:text-7xl">
						{record.title}
					</h1>
					<ShowcaseFacts record={record} />
					<div className="rule my-8" />
					<SimpleMarkdown
						value={record.body ?? ""}
						className="unclet-markdown"
					/>
				</aside>
			</div>
		</article>
	);
}
