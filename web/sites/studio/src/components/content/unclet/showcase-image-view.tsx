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
import { InputField } from "../../input-field";
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";

export function ShowcaseImagesView({ showcaseId }: { showcaseId: string }) {
	return (
		<CollectionView<ShowcaseImage, ShowcaseImageInput>
			collection="unclet.showcase_image"
			title="Einblickbilder"
			scope={showcaseId}
			inline
			rowKey={(record) => [record.showcaseId, record.imageId].join(":")}
			loadPage={(input) =>
				listShowcaseImages({ data: { ...input, showcaseId } })
			}
			remove={(record) =>
				deleteShowcaseImage({
					data: { showcaseId: record.showcaseId, imageId: record.imageId },
				})
			}
			create={(values) => createShowcaseImage({ data: values })}
			update={(record, values) =>
				updateShowcaseImage({
					data: {
						key: { showcaseId: record.showcaseId, imageId: record.imageId },
						values,
					},
				})
			}
			editor={{
				schema: showcaseImageInputSchema,
				initialValues: () => newShowcaseImageInput(showcaseId),
				valuesFromRecord: showcaseImageInputFromRecord,
				renderFields: (props) => <ShowcaseImageFields {...props} />,
			}}
			columns={[
				{
					id: "imageId",
					heading: m.studio_field_image_id(),
					render: (record) => (
						<ImageThumbnail site="unclet" id={record.imageId} />
					),
				},
				{
					id: "description",
					heading: m.studio_field_description(),
					render: (record) => record.description,
				},
			]}
		/>
	);
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
			<InputField
				name="description"
				label={m.studio_field_description()}
				value={values.description}
				required
				onChange={(event) => onChange("description", event.target.value)}
			/>
		</>
	);
}
