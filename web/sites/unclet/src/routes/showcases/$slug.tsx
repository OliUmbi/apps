import { imageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AssetImage } from "../../components/ui/asset-image";
import { getPublicRecord } from "../../content/public.functions";
export const Route = createFileRoute("/showcases/$slug")({
	loader: async ({ params }) => {
		const result = (await getPublicRecord({
			data: { resource: "unclet.showcase", value: params.slug, bySlug: true },
		})) as { record: ResourceRecord; children: ResourceRecord[] } | null;
		if (!result) throw notFound();
		return result;
	},
	component: Showcase,
});
function Showcase() {
	const { record, children } = Route.useLoaderData();
	const image = (id: unknown) =>
		imageUrl(
			import.meta.env.VITE_ASSETS_PUBLIC_URL ?? "http://localhost:8083",
			String(id),
		);
	return (
		<article className="showcase-detail shell pb-24 pt-32 md:pb-32 md:pt-36">
			<Link
				to="/showcases"
				className="mb-10 inline-flex items-center gap-2 text-sm text-bone/55 transition hover:text-brass-light"
			>
				<ArrowLeft size={17} aria-hidden="true" />
				{m.unclet_showcase_back()}
			</Link>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)] lg:gap-14 xl:gap-20">
				<div className="showcase-gallery">
					<AssetImage
						src={record.image_id ? image(record.image_id) : null}
						alt={String(record.title)}
						sizes="(min-width: 1024px) 64vw, 100vw"
						className="showcase-cover w-full object-cover"
					/>
					{children.length ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{children.map((item) => (
								<figure key={String(item.image_id)}>
									<AssetImage
										src={image(item.image_id)}
										alt={String(item.description)}
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
					<p className="eyebrow text-brass">
						{record.location} · {record.guest_count}
						{m.unclet_routes_showcases_slug_paragraph()}
					</p>
					<h1 className="display-title mt-7 text-5xl md:text-6xl xl:text-7xl">
						{record.title}
					</h1>
					<div className="rule my-8" />
					<SimpleMarkdown
						value={String(record.body ?? "")}
						className="unclet-markdown"
					/>
				</aside>
			</div>
		</article>
	);
}
