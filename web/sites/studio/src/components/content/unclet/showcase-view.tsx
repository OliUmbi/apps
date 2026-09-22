import { m } from "@oliumbi/i18n/messages";
import {
	newShowcaseInput,
	type Showcase,
	type ShowcaseInput,
	showcaseInputFromRecord,
	showcaseInputSchema,
} from "../../../model/content/unclet/showcase";
import {
	createShowcase,
	deleteShowcase,
	getShowcase,
	listShowcases,
	updateShowcase,
} from "../../../server/content/unclet/showcase.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { CheckboxField, NumberField } from "../editor-controls";
import { ImageField } from "../image-field";
import { SlugField } from "../slug-field";
import { ShowcaseImagesView } from "./showcase-image-view";

export function ShowcasesView() {
	return (
		<CollectionView<Showcase, ShowcaseInput>
			collection="unclet.showcase"
			title="Einblicke"
			rowKey={(record) => record.id}
			loadPage={(input) => listShowcases({ data: input })}
			loadRecord={(id) => getShowcase({ data: { id } })}
			remove={(record) => deleteShowcase({ data: { id: record.id } })}
			create={(values) => createShowcase({ data: values })}
			update={(record, values) =>
				updateShowcase({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: showcaseInputSchema,
				initialValues: newShowcaseInput,
				valuesFromRecord: showcaseInputFromRecord,
				renderFields: (props) => <ShowcaseFields {...props} />,
			}}
			columns={[
				{
					id: "title",
					heading: m.studio_field_title(),
					render: (record) => record.title,
				},
				{
					id: "location",
					heading: m.studio_field_location(),
					render: (record) => record.location,
				},
				{
					id: "guestCount",
					heading: m.studio_field_guest_count(),
					render: (record) => record.guestCount,
				},
				{
					id: "imageId",
					heading: m.studio_field_image_id(),
					render: (record) => (
						<ImageThumbnail site="unclet" id={record.imageId} />
					),
				},
				{
					id: "published",
					heading: m.studio_field_published(),
					render: (record) => (record.published ? m.yes() : m.no()),
				},
			]}
			renderRelated={(record) => (
				<div className="related-grid">
					<ShowcaseImagesView
						key={`showcase_image:${record.id}`}
						showcaseId={record.id}
					/>
				</div>
			)}
		/>
	);
}

function ShowcaseFields({
	values,
	onChange,
}: EditorFieldsProps<ShowcaseInput>) {
	return (
		<>
			<SlugField
				title={values.title}
				slug={values.slug}
				onTitleChange={(value) => onChange("title", value)}
				onSlugChange={(value) => onChange("slug", value)}
			/>
			<InputField
				name="location"
				label={m.studio_field_location()}
				value={values.location}
				required
				onChange={(event) => onChange("location", event.target.value)}
			/>
			<NumberField
				name="guestCount"
				label={m.studio_field_guest_count()}
				value={values.guestCount}
				min={0}
				step={1}
				required
				onChange={(value) => onChange("guestCount", value ?? Number.NaN)}
			/>
			<ImageField
				site="unclet"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<CheckboxField
				name="published"
				label={m.studio_field_published()}
				value={values.published}
				onChange={(value) => onChange("published", value)}
			/>
			<DateField
				name="publishedOn"
				label={m.studio_field_published_on()}
				value={values.publishedOn}
				nullable
				onChange={(value) => onChange("publishedOn", value)}
			/>
			<InputField
				name="body"
				label={m.studio_field_body()}
				value={values.body ?? ""}
				render={<textarea rows={18} />}
				onChange={(event) => onChange("body", event.target.value || null)}
			/>
		</>
	);
}
