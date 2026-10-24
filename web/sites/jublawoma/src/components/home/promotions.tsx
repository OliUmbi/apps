import { safeLinkHref } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { getPromotions } from "../../data/promotions";
import { AssetImage } from "../asset-image";

export function Promotions() {
	const query = useQuery({
		queryKey: ["promotions"],
		queryFn: () => getPromotions(),
	});
	if (!query.data?.length) return null;
	return (
		<div className="mx-auto w-[min(100%_-_2rem,1240px)] pt-8 pb-20">
			{query.data.map((promotion) => (
				<a
					key={promotion.id}
					href={safeLinkHref(promotion.link)}
					className="promotion-card group"
				>
					<div className="min-h-[18rem] bg-sage max-[850px]:min-h-[14rem]">
						<AssetImage
							src={promotion.image?.src}
							alt={promotion.image?.alt || promotion.title}
							sizes="(min-width: 850px) 38vw, 100vw"
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="promotion-body">
						<p className="kicker">{m.jublawoma_promotion_eyebrow()}</p>
						<h2 className="text-2xl font-bold">{promotion.title}</h2>
						<p className="mt-2 text-bark/70">{promotion.description}</p>
						<span className="mt-6 inline-flex items-center gap-2 border-b-2 border-current pb-[0.35rem] font-extrabold">
							{m.jublawoma_promotion_link()}{" "}
							<ArrowUpRight size={18} aria-hidden="true" />
						</span>
					</div>
				</a>
			))}
		</div>
	);
}
