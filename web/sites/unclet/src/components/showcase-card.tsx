import { imageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AssetImage } from "./ui/asset-image";
export function ShowcaseCard({
	item,
	index,
}: {
	item: ResourceRecord;
	index: number;
}) {
	return (
		<Link
			to="/showcases/$slug"
			params={{ slug: String(item.slug) }}
			className="group grid border-t border-brass/35 pt-6 md:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)] md:gap-12 md:pt-10"
		>
			<div className="image-treatment aspect-[16/10] md:aspect-[16/9]">
				<AssetImage
					src={
						item.image_id
							? imageUrl(
									import.meta.env.VITE_ASSETS_PUBLIC_URL ??
										"http://localhost:8083",
									String(item.image_id),
								)
							: null
					}
					alt={String(item.title)}
					sizes="(min-width: 768px) 58vw, 100vw"
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="flex flex-col justify-between border-b border-bone/15 py-7 md:py-2 md:pb-8">
				<div>
					<p className="font-mono text-xs tracking-[0.16em] text-brass uppercase">
						{String(index + 1).padStart(2, "0")} / {m.unclet_showcase_event()}
					</p>
					<h2 className="mt-6 font-serif text-4xl leading-tight md:text-6xl">
						{item.title}
					</h2>
					{item.body ? (
						<p className="mt-6 line-clamp-5 text-base leading-relaxed text-bone/55">
							{String(item.body)}
						</p>
					) : null}
				</div>
				<p className="mt-8 text-sm text-bone/50">
					{item.location} · {item.guest_count}
					{m.unclet_components_showcase_card_paragraph()}
				</p>
				<span className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-brass-light uppercase">
					{m.unclet_showcase_view()}{" "}
					<ArrowUpRight size={15} aria-hidden="true" />
				</span>
			</div>
		</Link>
	);
}
