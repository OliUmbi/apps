import { m } from "@oliumbi/i18n/messages";
import {
	newStoryImageInput,
	type StoryImage,
	type StoryImageInput,
	storyImageInputFromRecord,
	storyImageInputSchema,
} from "@oliumbi/jublawoma-data/content/story-image";
import {
	createStoryImage,
	deleteStoryImage,
	listStoryImages,
	updateStoryImage,
} from "../../../server/content/jublawoma/story-image.functions";
import { TextField } from "../../ui/text-field";
import type { CollectionProps } from "../collection";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { RelatedCollection } from "../related-collection";

// The images of one story, scoped to it: a related panel inside the story
// detail page. The rows carry no loadRecord, so opening one keeps the list
// snapshot as its detail data.
function storyImageCollection(
	storyId: string,
): CollectionProps<StoryImage, StoryImageInput> {
	return {
		collection: "jublawoma.story_image",
		scope: storyId,
		title: "Geschichtenbilder",
		rowKey: (record) => [record.storyId, record.imageId].join(":"),
		loadPage: (input) => listStoryImages({ data: { ...input, storyId } }),
		remove: (record) =>
			deleteStoryImage({
				data: { storyId: record.storyId, imageId: record.imageId },
			}),
		capability: {
			mode: "creatable",
			editor: {
				schema: storyImageInputSchema,
				initialValues: () => newStoryImageInput(storyId),
				valuesFromRecord: storyImageInputFromRecord,
				renderFields: (props) => <StoryImageFields {...props} />,
			},
			create: (values) => createStoryImage({ data: values }),
			update: (record, values) =>
				updateStoryImage({
					data: {
						key: { storyId: record.storyId, imageId: record.imageId },
						values,
						updatedAt: record.updatedAt,
					},
				}),
		},
		columns: [
			{
				id: "imageId",
				heading: m.image(),
				render: (record) => (
					<ImageThumbnail site="jublawoma" id={record.imageId} />
				),
			},
			{
				id: "description",
				heading: m.description(),
				render: (record) => record.description,
			},
		],
	};
}

export function StoryImagesRelated({ storyId }: { storyId: string }) {
	return <RelatedCollection {...storyImageCollection(storyId)} />;
}

function StoryImageFields({
	values,
	onChange,
}: EditorFieldsProps<StoryImageInput>) {
	return (
		<>
			<ImageField
				site="jublawoma"
				value={values.imageId}
				onChange={(value) => onChange("imageId", value ?? "")}
			/>
			<TextField
				name="description"
				label={m.description()}
				value={values.description}
				required
				onChange={(event) => onChange("description", event.target.value)}
			/>
		</>
	);
}
