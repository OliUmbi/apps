import { createFileRoute } from "@tanstack/react-router";
import { HomeHero } from "../components/home/home-hero";
import { JoinSection } from "../components/home/join-section";
import { NextEvent } from "../components/home/next-event";
import { TeamSection } from "../components/home/team-section";
import { ValuesSection } from "../components/home/values-section";
import { Promotions } from "../components/promotions";
import { getNextEvent } from "../content/content.functions";

export const Route = createFileRoute("/")({
	loader: () => getNextEvent(),
	component: Home,
});

function Home() {
	const nextEvent = Route.useLoaderData();
	return (
		<>
			<HomeHero />
			<Promotions />
			{nextEvent ? <NextEvent event={nextEvent} /> : null}
			<ValuesSection />
			<TeamSection />
			<JoinSection />
		</>
	);
}
