import { m } from "@oliumbi/i18n/messages";
import {
	newPromotionInput,
	type Promotion,
	type PromotionInput,
	promotionInputFromRecord,
	promotionInputSchema,
} from "../../../model/content/jublawoma/promotion";
import {
	createPromotion,
	deletePromotion,
	getPromotion,
	listPromotions,
	updatePromotion,
} from "../../../server/content/jublawoma/promotion.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import { CollectionView } from "../collection-view";
import type { EditorFieldsProps } from "../content-form";
import { displayTimestamp, ImageThumbnail } from "../display";
import { ImageField } from "../image-field";

export function PromotionsView() {
	return (
		<CollectionView<Promotion, PromotionInput>
			collection="jublawoma.promotion"
			title="Promotionen"
			rowKey={(record) => record.id}
			loadPage={(input) => listPromotions({ data: input })}
			loadRecord={(id) => getPromotion({ data: { id } })}
			remove={(record) => deletePromotion({ data: { id: record.id } })}
			create={(values) => createPromotion({ data: values })}
			update={(record, values) =>
				updatePromotion({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: promotionInputSchema,
				initialValues: newPromotionInput,
				valuesFromRecord: promotionInputFromRecord,
				renderFields: (props) => <PromotionFields {...props} />,
			}}
			columns={[
				{
					id: "title",
					heading: m.studio_field_title(),
					render: (record) => record.title,
				},
				{
					id: "link",
					heading: m.studio_field_link(),
					render: (record) => record.link,
				},
				{
					id: "imageId",
					heading: m.studio_field_image_id(),
					render: (record) => (
						<ImageThumbnail site="jublawoma" id={record.imageId} />
					),
				},
				{
					id: "startsAt",
					heading: m.studio_field_starts_at(),
					render: (record) => displayTimestamp(record.startsAt),
				},
				{
					id: "endsAt",
					heading: m.studio_field_ends_at(),
					render: (record) => displayTimestamp(record.endsAt),
				},
			]}
		/>
	);
}

function PromotionFields({
	values,
	onChange,
}: EditorFieldsProps<PromotionInput>) {
	return (
		<>
			<InputField
				name="title"
				label={m.studio_field_title()}
				value={values.title}
				required
				onChange={(event) => onChange("title", event.target.value)}
			/>
			<InputField
				name="description"
				label={m.studio_field_description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<InputField
				name="link"
				label={m.studio_field_link()}
				value={values.link}
				required
				onChange={(event) => onChange("link", event.target.value)}
			/>
			<ImageField
				site="jublawoma"
				value={values.imageId}
				nullable
				onChange={(value) => onChange("imageId", value)}
			/>
			<DateField
				name="startsAt"
				label={m.studio_field_starts_at()}
				value={values.startsAt}
				includeTime
				onChange={(value) => onChange("startsAt", value ?? "")}
			/>
			<DateField
				name="endsAt"
				label={m.studio_field_ends_at()}
				value={values.endsAt}
				includeTime
				onChange={(value) => onChange("endsAt", value ?? "")}
			/>
		</>
	);
}
