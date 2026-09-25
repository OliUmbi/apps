import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, PackageCheck } from "lucide-react";
import type { Product } from "../model/content";
import { AssetImage } from "./asset-image";

export function ProductIntroduction({ product }: { product: Product }) {
	return (
		<section className="shell py-5 md:py-8">
			<Link
				to="/products"
				className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
			>
				<ArrowLeft size={17} />
				{m.zelglihof_product_back_to_shop_link()}
			</Link>
			<div className="grid overflow-hidden rounded-[2rem] bg-cream lg:grid-cols-[1.1fr_0.9fr]">
				<div className="relative min-h-[27rem] lg:min-h-[42rem]">
					<AssetImage
						src={product.image}
						alt={product.name}
						sizes="(min-width: 1024px) 55vw, 100vw"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<span className="absolute left-5 top-5 rounded-full bg-cream/92 px-3 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
						{product.availability}
					</span>
				</div>
				<div className="flex flex-col justify-between p-7 md:p-12">
					<div>
						<p className="eyebrow text-clay">{product.eyebrow}</p>
						<h1 className="display-title mt-6 text-6xl md:text-7xl">
							{product.name}
						</h1>
						<p className="mt-7 text-lg leading-relaxed text-ink/65">
							{product.body}
						</p>
					</div>
					<div className="mt-12 grid gap-4 border-t border-forest/12 pt-7 text-sm font-semibold sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
						<span className="flex items-center gap-2">
							<PackageCheck size={19} className="text-clay" />
							{m.zelglihof_product_direct_sales()}
						</span>
						<span className="flex items-center gap-2">
							<MapPin size={19} className="text-clay" />
							{m.zelglihof_product_farm_pickup()}
						</span>
						<span className="flex items-center gap-2">
							<CalendarDays size={19} className="text-clay" />
							{m.zelglihof_product_confirmation_required()}
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
