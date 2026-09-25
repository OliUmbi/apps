import { m } from "@oliumbi/i18n/messages";
import {
	newPromotionInput,
	type Promotion,
	type PromotionInput,
	promotionInputFromRecord,
	promotionInputSchema,
} from "@oliumbi/zelglihof-data/content/promotion";
import { formatTimestamp } from "../../../model/dates";
import {
	createPromotion,
	deletePromotion,
	getPromotion,
	listPromotions,
	updatePromotion,
} from "../../../server/content/zelglihof/promotion.functions";
import { DateField } from "../../date-field";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { ImageThumbnail } from "../display";
import { ImageField } from "../image-field";
import { RoutedCollectionView } from "../routed-collection-view";

export function PromotionsView() {
	return (
		<RoutedCollectionView<Promotion, PromotionInput>
			collection="zelglihof.promotion"
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
					heading: m.title(),
					render: (record) => record.title,
				},
				{
					id: "link",
					heading: m.link(),
					render: (record) => record.link,
				},
				{
					id: "imageId",
					heading: m.image(),
					render: (record) => (
						<ImageThumbnail site="zelglihof" id={record.imageId} />
					),
				},
				{
					id: "startsAt",
					heading: m.studio_field_starts_at(),
					render: (record) => formatTimestamp(record.startsAt),
				},
				{
					id: "endsAt",
					heading: m.studio_field_ends_at(),
					render: (record) => formatTimestamp(record.endsAt),
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
				label={m.title()}
				value={values.title}
				required
				onChange={(event) => onChange("title", event.target.value)}
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
				name="link"
				label={m.link()}
				value={values.link}
				required
				onChange={(event) => onChange("link", event.target.value)}
			/>
			<ImageField
				site="zelglihof"
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
