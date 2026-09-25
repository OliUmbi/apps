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
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { InlineCollectionView } from "../inline-collection-view";

export function ArticleImagesView({ articleId }: { articleId: string }) {
	return (
		<InlineCollectionView<ArticleImage, ArticleImageInput>
			collection="zelglihof.article_image"
			title="Artikelbilder"
			scope={articleId}
			rowKey={(record) => [record.articleId, record.imageId].join(":")}
			loadPage={(input) => listArticleImages({ data: { ...input, articleId } })}
			remove={(record) =>
				deleteArticleImage({
					data: { articleId: record.articleId, imageId: record.imageId },
				})
			}
			create={(values) => createArticleImage({ data: values })}
			update={(record, values) =>
				updateArticleImage({
					data: {
						key: { articleId: record.articleId, imageId: record.imageId },
						values,
					},
				})
			}
			editor={{
				schema: articleImageInputSchema,
				initialValues: () => newArticleImageInput(articleId),
				valuesFromRecord: articleImageInputFromRecord,
				renderFields: (props) => <ArticleImageFields {...props} />,
			}}
			columns={[
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
			]}
		/>
	);
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
