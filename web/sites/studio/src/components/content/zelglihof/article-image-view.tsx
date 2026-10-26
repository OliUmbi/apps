import { m } from "@oliumbi/i18n/messages";
import {
	type ArticleImage,
	type ArticleImageInput,
	articleImageInputFromRecord,
	articleImageInputSchema,
	newArticleImageInput,
} from "@oliumbi/zelglihof-data/content/article-image";
import {
	createArticleImage,
	deleteArticleImage,
	listArticleImages,
	updateArticleImage,
} from "../../../server/content/zelglihof/article-image.functions";
import { TextField } from "../../ui/text-field";
import type { CollectionProps } from "../collection";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { RelatedCollection } from "../related-collection";

// The images of one article, scoped to it: a related panel inside the article
// detail page. The rows carry no loadRecord, so opening one keeps the list
// snapshot as its detail data.
function articleImageCollection(
	articleId: string,
): CollectionProps<ArticleImage, ArticleImageInput> {
	return {
		collection: "zelglihof.article_image",
		scope: articleId,
		title: "Artikelbilder",
		rowKey: (record) => [record.articleId, record.imageId].join(":"),
		loadPage: (input) => listArticleImages({ data: { ...input, articleId } }),
		remove: (record) =>
			deleteArticleImage({
				data: { articleId: record.articleId, imageId: record.imageId },
			}),
		capability: {
			mode: "creatable",
			editor: {
				schema: articleImageInputSchema,
				initialValues: () => newArticleImageInput(articleId),
				valuesFromRecord: articleImageInputFromRecord,
				renderFields: (props) => <ArticleImageFields {...props} />,
			},
			create: (values) => createArticleImage({ data: values }),
			update: (record, values) =>
				updateArticleImage({
					data: {
						key: { articleId: record.articleId, imageId: record.imageId },
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
					<ImageThumbnail site="zelglihof" id={record.imageId} />
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

export function ArticleImagesRelated({ articleId }: { articleId: string }) {
	return <RelatedCollection {...articleImageCollection(articleId)} />;
}

function ArticleImageFields({
	values,
	onChange,
}: EditorFieldsProps<ArticleImageInput>) {
	return (
		<>
			<ImageField
				site="zelglihof"
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
