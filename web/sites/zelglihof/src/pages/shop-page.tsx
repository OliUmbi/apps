import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Clock3, ShoppingBag } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import type { Product } from "../content/site-content";

export function ShopPage({ products }: { products: Product[] }) {
	return (
		<>
			<section className="shell grid gap-8 py-14 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-24">
				<div>
					<p className="eyebrow text-clay">
						{m.zelglihof_pages_shop_page_paragraph()}
					</p>
					<h1 className="display-title mt-5 text-6xl md:text-8xl">
						{m.zelglihof_pages_shop_page_heading()}
						<br />
						{m.zelglihof_pages_shop_page_heading_2()}
					</h1>
				</div>
				<div className="md:pb-2 md:pl-16">
					<p className="max-w-xl text-xl leading-relaxed text-ink/65">
						{m.zelglihof_pages_shop_page_paragraph_2()}
					</p>
					<div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
						<span className="flex items-center gap-2">
							<ShoppingBag size={18} className="text-clay" />
							{m.zelglihof_pages_shop_page_text()}
						</span>
						<span className="flex items-center gap-2">
							<Clock3 size={18} className="text-clay" />
							{m.zelglihof_pages_shop_page_text_2()}
						</span>
					</div>
				</div>
			</section>
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
							<img
								src={product.image}
								alt={product.shortName}
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
								{product.kind === "seasonal"
									? m.zelglihof_pages_shop_page_feedback()
									: m.zelglihof_pages_shop_page_feedback_2()}
								<ArrowRight
									size={18}
									className="transition-transform group-hover:translate-x-1"
								/>
							</span>
						</div>
					</Link>
				))}
			</section>
			<section className="bg-sage/35 py-20">
				<div className="shell grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
					<span className="grid size-16 place-items-center rounded-full bg-forest text-cream">
						<Bell />
					</span>
					<div>
						<h2 className="font-serif text-3xl font-bold">
							{m.zelglihof_pages_shop_page_heading_3()}
						</h2>
						<p className="mt-2 text-ink/60">
							{m.zelglihof_pages_shop_page_paragraph_3()}
						</p>
					</div>
					<a href="#newsletter" className="button-primary">
						{m.zelglihof_pages_shop_page_text_3()}
					</a>
				</div>
			</section>
			<NewsletterSignup />
		</>
	);
}
