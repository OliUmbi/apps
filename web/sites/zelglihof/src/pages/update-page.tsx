import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { findUpdate } from "../content/site-content";

export function UpdatePage({ slug }: { slug: string }) {
	const update = findUpdate(slug);
	if (!update)
		return (
			<section className="shell py-24">
				<p className="eyebrow text-clay">Nicht gefunden</p>
				<h1 className="display-title mt-5 text-6xl">
					Diese Nachricht ist nicht da.
				</h1>
				<Link to="/aktuelles" className="button-primary mt-8">
					Zurück zu Aktuelles
				</Link>
			</section>
		);
	return (
		<article>
			<header className="shell py-12 md:py-20">
				<Link
					to="/aktuelles"
					className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink"
				>
					<ArrowLeft size={17} /> Alle Neuigkeiten
				</Link>
				<p className="mt-12 text-xs font-bold uppercase tracking-[0.14em] text-clay">
					{update.category} · {update.date}
				</p>
				<h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
					{update.title}
				</h1>
				<p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink/60">
					{update.description}
				</p>
			</header>
			<div className="shell">
				<img
					src={update.image}
					alt=""
					className="max-h-[44rem] w-full rounded-[2rem] object-cover"
				/>
			</div>
			<div className="shell grid gap-10 py-16 md:grid-cols-[0.7fr_1.3fr] md:py-24">
				<aside>
					<p className="eyebrow text-moss">Vom Zelglihof</p>
				</aside>
				<div className="max-w-2xl space-y-6 text-lg leading-relaxed text-ink/70">
					<p>
						Auf einem Landwirtschaftsbetrieb bestimmt die Saison den Takt. Wir
						arbeiten mit dem, was Feld, Wetter und Tiere möglich machen – und
						geben erst dann ein Versprechen ab, wenn die Qualität stimmt.
					</p>
					<p>
						<strong>{update.title}</strong> ist deshalb mehr als eine kurze
						Meldung. Es ist der Moment, an dem Arbeit vom Hof direkt bei unseren
						Kundinnen und Kunden ankommt.
					</p>
					<hr className="my-10 border-forest/15" />
					<h2 className="font-serif text-4xl font-bold">Direkt informiert</h2>
					<p>
						Aktuelle Mengen und Abholinformationen findest du beim jeweiligen
						Produkt. Über den Newsletter erfährst du zudem rechtzeitig von neuen
						Verkaufsterminen und kurzen Erntefenstern.
					</p>
					{update.productId && (
						<Link
							to="/hofladen/$productId"
							params={{ productId: update.productId }}
							className="button-primary mt-4"
						>
							Zum Produkt <ArrowRight size={17} />
						</Link>
					)}
				</div>
			</div>
		</article>
	);
}
