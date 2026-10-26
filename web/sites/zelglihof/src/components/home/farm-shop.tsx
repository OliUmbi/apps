import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { availabilityLabel } from "../../model/availability";
import type { ProductSummary } from "../../model/content";
import { AssetImage } from "../asset-image";
import { ShopEmptyState } from "../shop-empty-state";
export function FarmShop({ products }: { products: ProductSummary[] }) {
	return (
		<section className="bg-cream py-24 md:py-32">
			<div className="shell">
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="eyebrow text-moss">
							{m.zelglihof_home_shop_eyebrow()}
						</p>
						<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 max-w-2xl text-5xl md:text-6xl">
							{m.zelglihof_home_shop_title()}
						</h2>
					</div>
					<Link
						to="/products"
						className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-forest/35 bg-transparent px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-forest transition hover:border-forest hover:bg-white/35"
					>
						{m.zelglihof_home_visit_shop()}
						<ArrowRight size={17} aria-hidden="true" />
					</Link>
				</div>
				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{products.length === 0 && (
						<div className="sm:col-span-2 lg:col-span-4">
							<ShopEmptyState />
						</div>
					)}
					{products.map((product) => (
						<Link
							key={product.id}
							to="/products/$productId"
							params={{ productId: product.id }}
							className="group"
						>
							<div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
								<AssetImage
									src={product.image}
									alt={product.name}
									sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
									className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
								/>
								<span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider backdrop-blur">
									{availabilityLabel(product.availability)}
								</span>
							</div>
							<div className="flex items-start justify-between gap-3 pt-4">
								<div>
									<h3 className="font-serif text-2xl font-bold">
										{product.name}
									</h3>
									<p className="mt-1 text-sm text-ink/55">
										{m.zelglihof_shop_farm_direct()}
									</p>
								</div>
								<ArrowRight
									className="mt-1 transition-transform group-hover:translate-x-1"
									aria-hidden="true"
									size={19}
								/>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
