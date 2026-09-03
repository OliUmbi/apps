import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Egg, Sprout, Wheat } from "lucide-react";
import { NewsletterSignup } from "../components/newsletter-signup";
import { products, updates } from "../content/site-content";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const featured = products[0];
	return (
		<>
			<section className="shell grid gap-5 pt-5 lg:grid-cols-[1.05fr_0.95fr] lg:pt-8">
				<div className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-forest p-7 text-cream md:p-11 lg:min-h-[42rem]">
					<div className="absolute -right-24 -top-20 size-72 rounded-full border border-white/10" />
					<div className="absolute -right-10 top-10 size-44 rounded-full border border-white/10" />
					<p className="eyebrow relative text-sun">
						Direkt vom Familienbetrieb
					</p>
					<div className="relative">
						<h1 className="display-title max-w-xl text-[clamp(4.2rem,9vw,7.8rem)]">
							Vom Hof.
							<br />
							<span className="text-sun">Für hier.</span>
						</h1>
						<p className="mt-7 max-w-md text-base leading-relaxed text-cream/72 md:text-lg">
							Fleisch aus eigener Mutterkuhhaltung, saisonale Produkte und
							ehrliche Einblicke in unseren Hof in Mägenwil.
						</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								to="/hofladen/$productId"
								params={{ productId: "rindfleisch" }}
								className="button-light"
							>
								Jetzt reservieren <ArrowRight size={17} />
							</Link>
							<Link
								to="/hof"
								className="button-secondary border-white/25 text-cream hover:border-white hover:bg-white/10"
							>
								Den Hof entdecken
							</Link>
						</div>
					</div>
					<a
						href="#aktuell"
						className="relative flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/55 hover:text-cream"
					>
						<ArrowDown size={16} /> Weiter zum Aktuellen
					</a>
				</div>
				<div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] lg:min-h-[42rem]">
					<img
						src="/images/demo/demo-hof.jpg"
						alt="Blick auf einen Schweizer Landwirtschaftsbetrieb"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
					<div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-white/20 bg-cream/92 p-5 text-ink shadow-xl backdrop-blur md:inset-x-7 md:bottom-7 md:p-6">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
									Aktuell auf dem Hof
								</p>
								<p className="mt-1 font-serif text-2xl font-bold">
									Mägenwiler Beef
								</p>
							</div>
							<span
								className="size-3 rounded-full bg-moss shadow-[0_0_0_7px_rgba(99,122,82,.16)]"
								aria-hidden="true"
							/>
						</div>
						<p className="mt-3 text-sm leading-relaxed text-ink/65">
							{featured.description}
						</p>
					</div>
				</div>
			</section>

			<section id="aktuell" className="shell py-24 md:py-32">
				<div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
					<div>
						<p className="eyebrow text-clay">Gerade aktuell</p>
						<h2 className="display-title mt-5 text-5xl md:text-6xl">
							Was auf dem Hof läuft.
						</h2>
					</div>
					<div className="lg:pl-20">
						<p className="max-w-xl text-lg leading-relaxed text-ink/65">
							Erntefenster sind kurz, Tiere haben ihren eigenen Rhythmus. Hier
							erfährst du, was frisch ist und was als Nächstes kommt.
						</p>
						<Link
							to="/aktuelles"
							className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-bold"
						>
							Alle Neuigkeiten <ArrowRight size={16} />
						</Link>
					</div>
				</div>
				<div className="mt-12 grid gap-5 md:grid-cols-3">
					{updates.map((update, index) => (
						<Link
							key={update.slug}
							to="/aktuelles/$slug"
							params={{ slug: update.slug }}
							className={`group overflow-hidden rounded-[1.5rem] bg-cream ${index === 0 ? "md:col-span-2" : ""}`}
						>
							<div
								className={`overflow-hidden ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}
							>
								<img
									src={update.image}
									alt=""
									className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
								/>
							</div>
							<div className="p-6">
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
									{update.category} · {update.date}
								</p>
								<h3 className="mt-3 font-serif text-2xl font-bold leading-tight">
									{update.title}
								</h3>
							</div>
						</Link>
					))}
				</div>
			</section>

			<section className="bg-cream py-24 md:py-32">
				<div className="shell">
					<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="eyebrow text-moss">Im Hofladen</p>
							<h2 className="display-title mt-5 max-w-2xl text-5xl md:text-6xl">
								Gutes hat hier einen kurzen Weg.
							</h2>
						</div>
						<Link to="/hofladen" className="button-secondary">
							Zum Hofladen <ArrowRight size={17} />
						</Link>
					</div>
					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{products.map((product) => (
							<Link
								key={product.id}
								to="/hofladen/$productId"
								params={{ productId: product.id }}
								className="group"
							>
								<div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
									<img
										src={product.image}
										alt={product.shortName}
										className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
									/>
									<span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wider backdrop-blur">
										{product.availability}
									</span>
								</div>
								<div className="flex items-start justify-between gap-3 pt-4">
									<div>
										<h3 className="font-serif text-2xl font-bold">
											{product.shortName}
										</h3>
										<p className="mt-1 text-sm text-ink/55">
											{product.eyebrow}
										</p>
									</div>
									<ArrowRight
										className="mt-1 transition-transform group-hover:translate-x-1"
										size={19}
									/>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section className="shell grid gap-5 py-24 md:grid-cols-[1.15fr_0.85fr] md:py-32">
				<div className="relative min-h-[34rem] overflow-hidden rounded-[2rem]">
					<img
						src="/images/demo/demo-saat.jpg"
						alt="Aussaat auf einem Feld"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
					<p className="absolute bottom-7 left-7 max-w-sm font-serif text-3xl font-bold text-cream md:bottom-10 md:left-10 md:text-4xl">
						Mutterkühe, Ackerbau und Spezialkulturen.
					</p>
				</div>
				<div className="flex flex-col justify-between rounded-[2rem] bg-sun p-7 md:p-10">
					<div>
						<p className="eyebrow">Familienbetrieb Habegger</p>
						<h2 className="display-title mt-6 text-5xl md:text-6xl">
							Mit Boden unter den Füssen.
						</h2>
						<p className="mt-6 text-lg leading-relaxed text-ink/70">
							Wir bewirtschaften einen vielseitigen Landwirtschaftsbetrieb nach
							ÖLN-Richtlinien, SGA und Swiss GAP – mit Respekt vor Tier, Boden
							und Saison.
						</p>
					</div>
					<div className="mt-12 grid grid-cols-3 gap-3 border-t border-ink/15 pt-6 text-center">
						<div>
							<Egg className="mx-auto" size={24} />
							<p className="mt-2 text-xs font-bold uppercase tracking-wider">
								Hühner
							</p>
						</div>
						<div>
							<Wheat className="mx-auto" size={24} />
							<p className="mt-2 text-xs font-bold uppercase tracking-wider">
								Ackerbau
							</p>
						</div>
						<div>
							<Sprout className="mx-auto" size={24} />
							<p className="mt-2 text-xs font-bold uppercase tracking-wider">
								Saisonal
							</p>
						</div>
					</div>
					<Link
						to="/hof"
						className="mt-8 inline-flex items-center gap-2 font-bold"
					>
						Mehr über unseren Hof <ArrowRight size={17} />
					</Link>
				</div>
			</section>

			<NewsletterSignup />
		</>
	);
}
