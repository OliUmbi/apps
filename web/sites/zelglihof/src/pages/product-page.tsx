import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, PackageCheck } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import { ProductVariants } from "../components/product-variants";
import { ReservationForm } from "../components/reservation-form";
import type { Product } from "../content/site-content";

export function ProductPage({ product }: { product: Product }) {
	if (!product)
		return (
			<section className="shell py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_product_page_paragraph()}
				</p>
				<h1 className="display-title mt-5 text-6xl">
					{m.zelglihof_pages_product_page_heading()}
				</h1>
				<Link to="/products" className="button-primary mt-8">
					{m.zelglihof_pages_product_page_text()}
				</Link>
			</section>
		);
	const orderable = product.kind !== "seasonal";
	return (
		<>
			<section className="shell py-5 md:py-8">
				<Link
					to="/products"
					className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
				>
					<ArrowLeft size={17} />
					{m.zelglihof_pages_product_page_text_2()}
				</Link>
				<div className="grid overflow-hidden rounded-[2rem] bg-cream lg:grid-cols-[1.1fr_0.9fr]">
					<div className="relative min-h-[27rem] lg:min-h-[42rem]">
						<img
							src={product.image}
							alt={product.name}
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
								{product.longDescription}
							</p>
						</div>
						<div className="mt-12 grid gap-4 border-t border-forest/12 pt-7 text-sm font-semibold sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
							<span className="flex items-center gap-2">
								<PackageCheck size={19} className="text-clay" />
								{m.zelglihof_pages_product_page_text_3()}
							</span>
							<span className="flex items-center gap-2">
								<MapPin size={19} className="text-clay" />
								{m.zelglihof_pages_product_page_text_4()}
							</span>
							<span className="flex items-center gap-2">
								<CalendarDays size={19} className="text-clay" />
								{m.zelglihof_pages_product_page_text_5()}
							</span>
						</div>
					</div>
				</div>
			</section>
			<ProductVariants product={product} />
			<section className="shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
				<div>
					<p className="eyebrow text-moss">
						{m.zelglihof_pages_product_page_paragraph_2()}
					</p>
					<h2 className="display-title mt-5 text-5xl">
						{m.zelglihof_pages_product_page_heading_2()}
					</h2>
					<div className="mt-8 grid gap-6 text-sm leading-relaxed text-ink/60">
						<p>
							<strong className="block text-ink">
								{m.zelglihof_pages_product_page_text_6()}
							</strong>
							{m.zelglihof_pages_product_page_paragraph_3()}
						</p>
						<p>
							<strong className="block text-ink">
								{m.zelglihof_pages_product_page_text_7()}
							</strong>
							{m.zelglihof_pages_product_page_paragraph_4()}
						</p>
						<p>
							<strong className="block text-ink">
								{m.zelglihof_pages_product_page_text_8()}
							</strong>
							{m.zelglihof_pages_product_page_paragraph_5()}
						</p>
					</div>
				</div>
				{orderable ? (
					<ReservationForm product={product} />
				) : (
					<div>
						<div className="rounded-[1.5rem] bg-sun p-7 md:p-9">
							<p className="eyebrow">
								{m.zelglihof_pages_product_page_paragraph_6()}
							</p>
							<h2 className="mt-5 font-serif text-4xl font-bold">
								{m.zelglihof_pages_product_page_heading_3()}
							</h2>
							<p className="mt-4 leading-relaxed text-ink/65">
								{m.zelglihof_pages_product_page_paragraph_7()}
							</p>
						</div>
					</div>
				)}
			</section>
			{!orderable && <NewsletterSignup />}
		</>
	);
}
