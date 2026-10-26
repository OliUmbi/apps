import { m } from "@oliumbi/i18n/messages";
import {
	newShowcaseImageInput,
	type ShowcaseImage,
	type ShowcaseImageInput,
	showcaseImageInputFromRecord,
	showcaseImageInputSchema,
} from "@oliumbi/unclet-data/content/showcase-image";
import {
	createShowcaseImage,
	deleteShowcaseImage,
	listShowcaseImages,
	updateShowcaseImage,
} from "../../../server/content/unclet/showcase-image.functions";
import { TextField } from "../../ui/text-field";
import type { CollectionProps } from "../collection";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { RelatedCollection } from "../related-collection";

// The images of one showcase, scoped to it: a related panel inside the
// showcase detail page. The rows carry no loadRecord, so opening one keeps
// the list snapshot as its detail data.
function showcaseImageCollection(
	showcaseId: string,
): CollectionProps<ShowcaseImage, ShowcaseImageInput> {
	return {
		collection: "unclet.showcase_image",
		scope: showcaseId,
		title: "Einblickbilder",
		rowKey: (record) => [record.showcaseId, record.imageId].join(":"),
		loadPage: (input) => listShowcaseImages({ data: { ...input, showcaseId } }),
		remove: (record) =>
			deleteShowcaseImage({
				data: { showcaseId: record.showcaseId, imageId: record.imageId },
			}),
		capability: {
			mode: "creatable",
			editor: {
				schema: showcaseImageInputSchema,
				initialValues: () => newShowcaseImageInput(showcaseId),
				valuesFromRecord: showcaseImageInputFromRecord,
				renderFields: (props) => <ShowcaseImageFields {...props} />,
			},
			create: (values) => createShowcaseImage({ data: values }),
			update: (record, values) =>
				updateShowcaseImage({
					data: {
						key: { showcaseId: record.showcaseId, imageId: record.imageId },
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
					<ImageThumbnail site="unclet" id={record.imageId} />
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

export function ShowcaseImagesRelated({ showcaseId }: { showcaseId: string }) {
	return <RelatedCollection {...showcaseImageCollection(showcaseId)} />;
}

function ShowcaseImageFields({
	values,
	onChange,
}: EditorFieldsProps<ShowcaseImageInput>) {
	return (
		<>
			<ImageField
				site="unclet"
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
