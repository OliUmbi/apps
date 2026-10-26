import { m } from "@oliumbi/i18n/messages";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { EventsIntroduction } from "../components/events-introduction";
import { EventsList } from "../components/events-list";

import { getEventPage } from "../data/events";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/events")({
	loader: () => getEventPage({ data: { page: 0 } }),
	head: () =>
		pageHead({
			title: m.jublawoma_events_title(),
			description: m.jublawoma_events_description(),
		}),
	component: EventsPage,
});
function EventsPage() {
	const initialPage = Route.useLoaderData();
	return (
		<>
			<EventsIntroduction />
			<PaginatedList
				queryKey={["events"]}
				initialPage={initialPage}
				load={(page) => getEventPage({ data: { page } })}
				containerClassName="shell"
			>
				{(events) => <EventsList events={events} />}
			</PaginatedList>
		</>
	);
}
