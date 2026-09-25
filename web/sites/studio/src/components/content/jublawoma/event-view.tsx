import { m } from "@oliumbi/i18n/messages";
import {
	type Event,
	type EventInput,
	eventInputFromRecord,
	eventInputSchema,
	newEventInput,
} from "@oliumbi/jublawoma-data/content/event";
import { formatDate } from "../../../model/dates";
import {
	createEvent,
	deleteEvent,
	getEvent,
	listEvents,
	updateEvent,
} from "../../../server/content/jublawoma/event.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { RoutedCollectionView } from "../routed-collection-view";

export function EventsView() {
	return (
		<RoutedCollectionView<Event, EventInput>
			collection="jublawoma.event"
			title="Anlässe"
			rowKey={(record) => record.id}
			loadPage={(input) => listEvents({ data: input })}
			loadRecord={(id) => getEvent({ data: { id } })}
			remove={(record) => deleteEvent({ data: { id: record.id } })}
			create={(values) => createEvent({ data: values })}
			update={(record, values) =>
				updateEvent({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: eventInputSchema,
				initialValues: newEventInput,
				valuesFromRecord: eventInputFromRecord,
				renderFields: (props) => <EventFields {...props} />,
			}}
			columns={[
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "location",
					heading: m.location(),
					render: (record) => record.location,
				},
				{
					id: "imageId",
					heading: m.image(),
					render: (record) => (
						<ImageThumbnail site="jublawoma" id={record.imageId} />
					),
				},
				{
					id: "startsOn",
					heading: m.studio_field_starts_on(),
					render: (record) => formatDate(record.startsOn),
				},
				{
					id: "endsOn",
					heading: m.studio_field_ends_on(),
					render: (record) => formatDate(record.endsOn),
				},
			]}
		/>
	);
}

function EventFields({ values, onChange }: EditorFieldsProps<EventInput>) {
	return (
		<>
			<InputField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<InputField
				name="description"
				label={m.description()}
				value={values.description ?? ""}
				render={<textarea rows={4} />}
				onChange={(event) =>
					onChange("description", event.target.value || null)
				}
			/>
			<InputField
				name="location"
				label={m.location()}
				value={values.location}
				required
				onChange={(event) => onChange("location", event.target.value)}
			/>
			<ImageField
				site="jublawoma"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<DateField
				name="startsOn"
				label={m.studio_field_starts_on()}
				value={values.startsOn}
				onChange={(value) => onChange("startsOn", value ?? "")}
			/>
			<DateField
				name="endsOn"
				label={m.studio_field_ends_on()}
				value={values.endsOn}
				onChange={(value) => onChange("endsOn", value ?? "")}
			/>
		</>
	);
}
