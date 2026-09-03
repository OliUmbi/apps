import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, PackageCheck } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import { ReservationForm } from "../components/reservation-form";
import { findProduct } from "../content/site-content";

export function ProductPage({ productId }: { productId: string }) {
	const product = findProduct(productId);
	if (!product)
		return (
			<section className="shell py-24">
				<p className="eyebrow text-clay">Nicht gefunden</p>
				<h1 className="display-title mt-5 text-6xl">
					Dieses Produkt ist nicht da.
				</h1>
				<Link to="/hofladen" className="button-primary mt-8">
					Zurück zum Hofladen
				</Link>
			</section>
		);
	const orderable = product.kind !== "seasonal";
	return (
		<>
			<section className="shell py-5 md:py-8">
				<Link
					to="/hofladen"
					className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-ink"
				>
					<ArrowLeft size={17} /> Zurück zum Hofladen
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
								<PackageCheck size={19} className="text-clay" /> Direktverkauf
							</span>
							<span className="flex items-center gap-2">
								<MapPin size={19} className="text-clay" /> Abholung am Hof
							</span>
							<span className="flex items-center gap-2">
								<CalendarDays size={19} className="text-clay" /> Nach
								Bestätigung
							</span>
						</div>
					</div>
				</div>
			</section>
			<section className="shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
				<div>
					<p className="eyebrow text-moss">So funktioniert es</p>
					<h2 className="display-title mt-5 text-5xl">
						Reservieren statt Warenkorb.
					</h2>
					<div className="mt-8 grid gap-6 text-sm leading-relaxed text-ink/60">
						<p>
							<strong className="block text-ink">1 · Auswahl senden</strong>
							Wähle Variante und Menge. E-Mail oder Telefonnummer genügt.
						</p>
						<p>
							<strong className="block text-ink">
								2 · Persönliche Bestätigung
							</strong>
							Wir prüfen den Vorrat und melden uns mit Termin und Details.
						</p>
						<p>
							<strong className="block text-ink">
								3 · Auf dem Hof abholen
							</strong>
							Bezahlung und Übergabe erfolgen unkompliziert vor Ort.
						</p>
					</div>
				</div>
				{orderable ? (
					<ReservationForm product={product} />
				) : (
					<div>
						<div className="rounded-[1.5rem] bg-sun p-7 md:p-9">
							<p className="eyebrow">Gerade nicht in Saison</p>
							<h2 className="mt-5 font-serif text-4xl font-bold">
								Wir sagen Bescheid, wenn es wieder losgeht.
							</h2>
							<p className="mt-4 leading-relaxed text-ink/65">
								Saisonprodukte werden erst freigeschaltet, wenn die Ernte bereit
								ist. So versprechen wir nie mehr, als tatsächlich verfügbar ist.
							</p>
						</div>
					</div>
				)}
			</section>
			{!orderable && <NewsletterSignup />}
		</>
	);
}
