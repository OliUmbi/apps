import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Promotions } from "../components/promotions";
import { dateLabel } from "../content";
import { getNextEvent } from "../content/content.functions";

export const Route = createFileRoute("/")({
	loader: () => getNextEvent(),
	component: Home,
});

const values = [
	{
		n: "01",
		title: m.jublawoma_routes_index_title(),
		copy: m.jublawoma_routes_index_copy(),
		art: "dog.svg",
	},
	{
		n: "02",
		title: m.jublawoma_routes_index_title_2(),
		copy: m.jublawoma_routes_index_copy_2(),
		art: "float.svg",
	},
	{
		n: "03",
		title: m.jublawoma_value_faith_title(),
		copy: m.jublawoma_value_faith_copy(),
		art: "meditating.svg",
	},
	{
		n: "04",
		title: m.jublawoma_value_creative_title(),
		copy: m.jublawoma_value_creative_copy(),
		art: "messy.svg",
	},
	{
		n: "05",
		title: m.jublawoma_routes_index_title_3(),
		copy: m.jublawoma_routes_index_copy_3(),
		art: "plant.svg",
	},
];

function Home() {
	const next = Route.useLoaderData();
	return (
		<>
			<section className="hero">
				<div className="hero-noise" />
				<div className="shell hero-grid">
					<div className="hero-copy">
						<p className="kicker light">
							{m.jublawoma_routes_index_paragraph()}
						</p>
						<h1>
							{m.jublawoma_routes_index_heading()}
							<br />
							{m.jublawoma_routes_index_heading_2()}
							<em>{m.jublawoma_routes_index_text()}</em>
						</h1>
						<p>{m.jublawoma_routes_index_paragraph_2()}</p>
						<div className="button-row">
							<Link to="/join" className="button light">
								{m.jublawoma_routes_index_text_2()}
								<ArrowRight size={18} />
							</Link>
							<Link to="/events" className="text-link light">
								{m.jublawoma_routes_index_text_3()}
							</Link>
						</div>
					</div>
					<div className="hero-art">
						<span className="sun" />
						<img
							src="/assets/images/doodles/swinging.svg"
							alt={m.jublawoma_routes_index_alt()}
						/>
					</div>
				</div>
				<div className="hero-ticker">
					<span>{m.jublawoma_routes_index_text_4()}</span>
					<i /> <span>{m.jublawoma_routes_index_text_5()}</span>
					<i /> <span>{m.jublawoma_routes_index_text_6()}</span>
					<i /> <span>{m.jublawoma_routes_index_text_7()}</span>
				</div>
			</section>
			<Promotions />
			{next ? (
				<section className="next-event">
					<div className="shell event-banner">
						<p className="kicker">{m.jublawoma_routes_index_paragraph_3()}</p>
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
							to="/events/$eventId"
							params={{ eventId: next.id }}
							className="round-link"
							aria-label={m.jublawoma_routes_index_aria_label()}
						>
							<ArrowRight />
						</Link>
					</div>
				</section>
			) : null}
			<section className="section shell">
				<div className="section-intro">
					<p className="kicker">{m.jublawoma_routes_index_paragraph_4()}</p>
					<h2>
						{m.jublawoma_routes_index_heading_3()}
						<br />
						<span>{m.jublawoma_routes_index_text_8()}</span>
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
						alt={m.jublawoma_routes_index_alt_2()}
					/>
					<span>
						{m.jublawoma_routes_index_text_9()}
						<small>
							{m.jublawoma_routes_index_text_10()}
							<br />
							{m.jublawoma_routes_index_text_11()}
						</small>
					</span>
				</div>
				<div className="photo-copy">
					<p className="kicker">{m.jublawoma_routes_index_paragraph_5()}</p>
					<h2>{m.jublawoma_routes_index_heading_4()}</h2>
					<p>{m.jublawoma_routes_index_paragraph_6()}</p>
					<Link to="/about" className="text-link">
						{m.jublawoma_routes_index_text_12()}
						<ArrowRight size={16} />
					</Link>
				</div>
			</section>
			<section className="join-band">
				<div className="shell join-grid">
					<img src="/assets/images/doodles/loving.svg" alt="" />
					<div>
						<p className="kicker light">
							{m.jublawoma_routes_index_paragraph_7()}
						</p>
						<h2>{m.jublawoma_routes_index_heading_5()}</h2>
						<p>{m.jublawoma_routes_index_paragraph_8()}</p>
						<Link to="/join" className="button light">
							{m.jublawoma_routes_index_text_13()}
							<ArrowRight size={18} />
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
