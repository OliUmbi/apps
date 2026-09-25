import { m } from "@oliumbi/i18n/messages";
import {
	newStoryInput,
	type Story,
	type StoryInput,
	storyInputFromRecord,
	storyInputSchema,
} from "@oliumbi/jublawoma-data/content/story";
import { formatDate } from "../../../model/dates";
import {
	createStory,
	deleteStory,
	getStory,
	listStories,
	updateStory,
} from "../../../server/content/jublawoma/story.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { CheckboxField } from "../editor-controls";
import { ImageField } from "../image-field";
import { RoutedCollectionView } from "../routed-collection-view";
import { SlugField } from "../slug-field";
import { StoryImagesView } from "./story-image-view";

export function StoriesView() {
	return (
		<RoutedCollectionView<Story, StoryInput>
			collection="jublawoma.story"
			title="Geschichten"
			rowKey={(record) => record.id}
			loadPage={(input) => listStories({ data: input })}
			loadRecord={(id) => getStory({ data: { id } })}
			remove={(record) => deleteStory({ data: { id: record.id } })}
			create={(values) => createStory({ data: values })}
			update={(record, values) =>
				updateStory({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: storyInputSchema,
				initialValues: newStoryInput,
				valuesFromRecord: storyInputFromRecord,
				renderFields: (props) => <StoryFields {...props} />,
			}}
			columns={[
				{
					id: "title",
					heading: m.title(),
					render: (record) => record.title,
				},
				{
					id: "author",
					heading: m.author(),
					render: (record) => record.author,
				},
				{
					id: "imageId",
					heading: m.image(),
					render: (record) => (
						<ImageThumbnail site="jublawoma" id={record.imageId} />
					),
				},
				{
					id: "published",
					heading: m.studio_field_published(),
					render: (record) => (record.published ? m.yes() : m.no()),
				},
				{
					id: "publishedOn",
					heading: m.studio_field_published_on(),
					render: (record) => formatDate(record.publishedOn),
				},
			]}
			renderRelated={(record) => (
				<div className="related-grid">
					<StoryImagesView
						key={`story_image:${record.id}`}
						storyId={record.id}
					/>
				</div>
			)}
		/>
	);
}

function StoryFields({ values, onChange }: EditorFieldsProps<StoryInput>) {
	return (
		<>
			<SlugField
				title={values.title}
				slug={values.slug}
				onTitleChange={(value) => onChange("title", value)}
				onSlugChange={(value) => onChange("slug", value)}
			/>
			<InputField
				name="description"
				label={m.description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<InputField
				name="author"
				label={m.author()}
				value={values.author}
				required
				onChange={(event) => onChange("author", event.target.value)}
			/>
			<ImageField
				site="jublawoma"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<InputField
				name="body"
				label={m.body()}
				value={values.body}
				required
				render={<textarea rows={18} />}
				onChange={(event) => onChange("body", event.target.value)}
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
		</>
	);
}
