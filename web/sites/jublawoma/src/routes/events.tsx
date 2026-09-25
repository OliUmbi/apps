import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { createFileRoute } from "@tanstack/react-router";
import { EventsIntroduction } from "../components/events-introduction";
import { EventsList } from "../components/events-list";

import { getEventPage } from "../data/events";

export const Route = createFileRoute("/events")({
	loader: () => getEventPage({ data: { page: 0 } }),
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
			>
				{(events) => <EventsList events={events} />}
			</PaginatedList>
		</>
	);
}
