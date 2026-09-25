import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ProductSummary } from "../model/content";
import { AssetImage } from "./asset-image";
export function ProductCatalog({ products }: { products: ProductSummary[] }) {
	if (products.length === 0) return null;
	return (
		<section className="shell grid gap-6 pb-24 md:grid-cols-2">
			{products.map((product, index) => (
				<Link
					key={product.id}
					to="/products/$productId"
					params={{ productId: product.id }}
					className={`group relative overflow-hidden rounded-[2rem] bg-cream ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-2" : ""}`}
				>
					<div
						className={`relative overflow-hidden ${index === 0 ? "min-h-[25rem]" : "aspect-[5/4]"}`}
					>
						<AssetImage
							src={product.image}
							alt={product.name}
							sizes="(min-width: 768px) 50vw, 100vw"
							className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
						/>
						<span className="absolute left-5 top-5 rounded-full bg-cream/92 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-wider backdrop-blur">
							{product.availability}
						</span>
					</div>
					<div className="flex flex-col justify-between p-6 md:p-9">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
								{product.eyebrow}
							</p>
							<h2 className="mt-3 font-serif text-4xl font-bold md:text-5xl">
								{product.name}
							</h2>
							<p className="mt-5 max-w-lg leading-relaxed text-ink/60">
								{product.description}
							</p>
						</div>
						<span className="mt-8 inline-flex items-center gap-2 font-bold">
							{product.reservationOpen
								? m.zelglihof_shop_view_options()
								: m.zelglihof_shop_view_product()}
							<ArrowRight
								size={18}
								className="transition-transform group-hover:translate-x-1"
							/>
						</span>
					</div>
				</Link>
			))}
		</section>
	);
}
