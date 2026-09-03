import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Clock3, ShoppingBag } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import { products } from "../content/site-content";

export function ShopPage() {
	return (
		<>
			<section className="shell grid gap-8 py-14 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-24">
				<div>
					<p className="eyebrow text-clay">Hofladen</p>
					<h1 className="display-title mt-5 text-6xl md:text-8xl">
						Nah dran.
						<br />
						Frisch da.
					</h1>
				</div>
				<div className="md:pb-2 md:pl-16">
					<p className="max-w-xl text-xl leading-relaxed text-ink/65">
						In unserem kleinen Hofladen findest du täglich frische Eier und je
						nach Saison weitere Köstlichkeiten direkt vom Feld.
					</p>
					<div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
						<span className="flex items-center gap-2">
							<ShoppingBag size={18} className="text-clay" /> Direkt ab Hof
						</span>
						<span className="flex items-center gap-2">
							<Clock3 size={18} className="text-clay" /> Solange Vorrat
						</span>
					</div>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24 md:grid-cols-2">
				{products.map((product, index) => (
					<Link
						key={product.id}
						to="/hofladen/$productId"
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
									? "Produkt ansehen"
									: "Auswahl ansehen"}
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
							Saisonstart nicht verpassen.
						</h2>
						<p className="mt-2 text-ink/60">
							Wir schreiben nur, wenn es vom Hof wirklich etwas zu erzählen oder
							zu holen gibt.
						</p>
					</div>
					<a href="#newsletter" className="button-primary">
						Newsletter abonnieren
					</a>
				</div>
			</section>
			<NewsletterSignup />
		</>
	);
}
