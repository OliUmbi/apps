import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { dateLabel } from "../content";
import { getEvents } from "../content/content.functions";

export const Route = createFileRoute("/")({
	loader: () => getEvents(),
	component: Home,
});

const values = [
	{
		n: "01",
		title: "Zusammen sein",
		copy: "Alle werden akzeptiert und respektiert. Gemeinsam haben wir Spass.",
		art: "dog.svg",
	},
	{
		n: "02",
		title: "Mitbestimmen",
		copy: "Ob gross oder klein: Eigene Ideen gehören dazu und gestalten unser Scharleben.",
		art: "float.svg",
	},
	{
		n: "03",
		title: "Natur erleben",
		copy: "Wir sind draussen unterwegs, entdecken Neues und gehen bewusst mit der Natur um.",
		art: "plant.svg",
	},
];

function Home() {
	const events = Route.useLoaderData();
	const today = new Date().toISOString().slice(0, 10);
	const next = events.find((event) => event.endsOn >= today) ?? events[0];
	return (
		<>
			<section className="hero">
				<div className="hero-noise" />
				<div className="shell hero-grid">
					<div className="hero-copy">
						<p className="kicker light">Jungwacht Blauring · seit 1981</p>
						<h1>
							Hier wird aus
							<br />
							Freizeit <em>Abenteuer.</em>
						</h1>
						<p>
							Rund 100 Kinder und 40 Leitende aus Wohlenschwil, Mägenwil und
							Tägerig. Gemeinsam draussen, kreativ und mittendrin.
						</p>
						<div className="button-row">
							<Link to="/mitmachen" className="button light">
								Jubla kennenlernen <ArrowRight size={18} />
							</Link>
							<Link to="/anlaesse" className="text-link light">
								Nächste Anlässe
							</Link>
						</div>
					</div>
					<div className="hero-art">
						<span className="sun" />
						<img
							src="/assets/images/doodles/swinging.svg"
							alt="Illustrierte Person auf einer Schaukel"
						/>
					</div>
				</div>
				<div className="hero-ticker">
					<span>Zusammen sein</span>
					<i /> <span>Mitbestimmen</span>
					<i /> <span>Kreativ sein</span>
					<i /> <span>Natur erleben</span>
				</div>
			</section>
			{next ? (
				<section className="next-event">
					<div className="shell event-banner">
						<p className="kicker">Als Nächstes</p>
						<div>
							<strong>{next.title}</strong>
							<span>
								<CalendarDays size={15} />{" "}
								{dateLabel(next.startsOn, next.endsOn)}
							</span>
							<span>
								<MapPin size={15} /> {next.location}
							</span>
						</div>
						<Link
							to="/anlaesse/$slug"
							params={{ slug: next.slug }}
							className="round-link"
							aria-label="Anlass öffnen"
						>
							<ArrowRight />
						</Link>
					</div>
				</section>
			) : null}
			<section className="section shell">
				<div className="section-intro">
					<p className="kicker">Was uns bewegt</p>
					<h2>
						Fünf Grundsätze.
						<br />
						<span>Unzählige Erlebnisse.</span>
					</h2>
				</div>
				<div className="value-grid">
					{values.map((value) => (
						<article className="value-card" key={value.n}>
							<span>{value.n}</span>
							<img src={`/assets/images/doodles/${value.art}`} alt="" />
							<h3>{value.title}</h3>
							<p>{value.copy}</p>
						</article>
					))}
				</div>
			</section>
			<section className="photo-section shell">
				<div className="photo-frame">
					<img
						src="/assets/images/people/leiter.jpg"
						alt="Das Leitungsteam der Jubla Woma"
					/>
					<span>
						40×
						<small>
							ehrenamtliches
							<br />
							Engagement
						</small>
					</span>
				</div>
				<div className="photo-copy">
					<p className="kicker">Die Menschen dahinter</p>
					<h2>Jung, ausgebildet und mit ganzem Herzen dabei.</h2>
					<p>
						Unser Leitungsteam plant Gruppenstunden, Anlässe und Lager. Die
						Leitenden übernehmen Verantwortung und bilden sich regelmässig
						weiter.
					</p>
					<Link to="/ueber-uns" className="text-link">
						Team kennenlernen <ArrowRight size={16} />
					</Link>
				</div>
			</section>
			<section className="join-band">
				<div className="shell join-grid">
					<img src="/assets/images/doodles/loving.svg" alt="" />
					<div>
						<p className="kicker light">Platz für neue Geschichten</p>
						<h2>Dein Kind ist in der 3. Klasse oder älter?</h2>
						<p>
							Dann darf es unverbindlich Jubla-Luft schnuppern und unsere
							Gemeinschaft kennenlernen.
						</p>
						<Link to="/mitmachen" className="button light">
							So funktioniert’s <ArrowRight size={18} />
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
