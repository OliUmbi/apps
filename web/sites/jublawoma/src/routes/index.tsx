import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/home/hero";
import { JoinSection } from "../components/home/join-section";
import { NextEvent } from "../components/home/next-event";
import { Promotions } from "../components/home/promotions";
import { TeamSection } from "../components/home/team-section";
import { ValuesSection } from "../components/home/values-section";
import { getNextEvent } from "../data/events";

export const Route = createFileRoute("/")({
	loader: () => getNextEvent(),
	component: Home,
});

function Home() {
	const nextEvent = Route.useLoaderData();
	return (
		<>
			<Hero />
			<Promotions />
			{nextEvent ? <NextEvent event={nextEvent} /> : null}
			<ValuesSection />
			<TeamSection />
			<JoinSection />
		</>
	);
}
