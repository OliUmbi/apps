import { m } from "@oliumbi/i18n/messages";
import {
	type Article,
	type ArticleInput,
	articleInputFromRecord,
	articleInputSchema,
	newArticleInput,
} from "@oliumbi/zelglihof-data/content/article";
import {
	createArticle,
	deleteArticle,
	getArticle,
	listArticles,
	updateArticle,
} from "../../../server/content/zelglihof/article.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { displayDate, ImageThumbnail } from "../display";
import { CheckboxField } from "../editor-controls";
import { ImageField } from "../image-field";
import { SlugField } from "../slug-field";
import { ArticleImagesView } from "./article-image-view";

export function ArticlesView() {
	return (
		<CollectionView<Article, ArticleInput>
			collection="zelglihof.article"
			title="Aktuelles"
			rowKey={(record) => record.id}
			loadPage={(input) => listArticles({ data: input })}
			loadRecord={(id) => getArticle({ data: { id } })}
			remove={(record) => deleteArticle({ data: { id: record.id } })}
			create={(values) => createArticle({ data: values })}
			update={(record, values) =>
				updateArticle({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: articleInputSchema,
				initialValues: newArticleInput,
				valuesFromRecord: articleInputFromRecord,
				renderFields: (props) => <ArticleFields {...props} />,
			}}
			columns={[
				{
					id: "title",
					heading: m.studio_field_title(),
					render: (record) => record.title,
				},
				{
					id: "imageId",
					heading: m.studio_field_image_id(),
					render: (record) => (
						<ImageThumbnail site="zelglihof" id={record.imageId} />
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
					render: (record) => displayDate(record.publishedOn),
				},
			]}
			renderRelated={(record) => (
				<div className="related-grid">
					<ArticleImagesView
						key={`article_image:${record.id}`}
						articleId={record.id}
					/>
				</div>
			)}
		/>
	);
}

function ArticleFields({ values, onChange }: EditorFieldsProps<ArticleInput>) {
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
				label={m.studio_field_description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<ImageField
				site="zelglihof"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<InputField
				name="body"
				label={m.studio_field_body()}
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
