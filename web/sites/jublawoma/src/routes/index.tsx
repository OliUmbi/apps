import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/home/hero";
import { JoinSection } from "../components/home/join-section";
import { NextEvent } from "../components/home/next-event";
import { Promotions } from "../components/home/promotions";
import { TeamSection } from "../components/home/team-section";
import { ValuesSection } from "../components/home/values-section";
import { getNextEvent } from "../data/events";
import { getPromotions } from "../data/promotions";

export const Route = createFileRoute("/")({
	head: () => ({
		// The hero illustration is the largest paint on this page; discover it
		// before the body is parsed.
		links: [
			{
				rel: "preload",
				href: "/assets/images/doodles/swinging.svg",
				as: "image",
				type: "image/svg+xml",
				fetchPriority: "high",
			},
		],
	}),
	loader: async () => {
		const [nextEvent, promotions] = await Promise.all([
			getNextEvent(),
			// A promotions failure must not take the home page down with it: the
			// section renders its own error branch for the null seed (J-07).
			getPromotions().catch(() => null),
		]);
		return { nextEvent, promotions };
	},
	component: Home,
});

function Home() {
	const { nextEvent, promotions } = Route.useLoaderData();
	return (
		<>
			<Hero />
			<Promotions promotions={promotions} />
			{nextEvent ? <NextEvent event={nextEvent} /> : null}
			<ValuesSection />
			<TeamSection />
			<JoinSection />
		</>
	);
}
