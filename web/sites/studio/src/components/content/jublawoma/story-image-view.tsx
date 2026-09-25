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
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { InlineCollectionView } from "../inline-collection-view";

export function StoryImagesView({ storyId }: { storyId: string }) {
	return (
		<InlineCollectionView<StoryImage, StoryImageInput>
			collection="jublawoma.story_image"
			title="Geschichtenbilder"
			scope={storyId}
			rowKey={(record) => [record.storyId, record.imageId].join(":")}
			loadPage={(input) => listStoryImages({ data: { ...input, storyId } })}
			remove={(record) =>
				deleteStoryImage({
					data: { storyId: record.storyId, imageId: record.imageId },
				})
			}
			create={(values) => createStoryImage({ data: values })}
			update={(record, values) =>
				updateStoryImage({
					data: {
						key: { storyId: record.storyId, imageId: record.imageId },
						values,
					},
				})
			}
			editor={{
				schema: storyImageInputSchema,
				initialValues: () => newStoryImageInput(storyId),
				valuesFromRecord: storyImageInputFromRecord,
				renderFields: (props) => <StoryImageFields {...props} />,
			}}
			columns={[
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
			]}
		/>
	);
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
			<InputField
				name="description"
				label={m.description()}
				value={values.description}
				required
				onChange={(event) => onChange("description", event.target.value)}
			/>
		</>
	);
}
