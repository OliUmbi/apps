import { m } from "@oliumbi/i18n/messages";
import {
	newReviewInput,
	type Review,
	type ReviewInput,
	reviewInputFromRecord,
	reviewInputSchema,
} from "@oliumbi/unclet-data/content/review";
import {
	createReview,
	deleteReview,
	getReview,
	listReviews,
	updateReview,
} from "../../../server/content/unclet/review.functions";
import { InputField } from "../../input-field";
import type { EditorFieldsProps } from "../content-form";
import { CheckboxField, NumberField } from "../editor-controls";
import { RoutedCollectionView } from "../routed-collection-view";

export function ReviewsView() {
	return (
		<RoutedCollectionView<Review, ReviewInput>
			collection="unclet.review"
			title="Bewertungen"
			rowKey={(record) => record.id}
			loadPage={(input) => listReviews({ data: input })}
			loadRecord={(id) => getReview({ data: { id } })}
			remove={(record) => deleteReview({ data: { id: record.id } })}
			create={(values) => createReview({ data: values })}
			update={(record, values) =>
				updateReview({ data: { key: { id: record.id }, values } })
			}
			editor={{
				schema: reviewInputSchema,
				initialValues: newReviewInput,
				valuesFromRecord: reviewInputFromRecord,
				renderFields: (props) => <ReviewFields {...props} />,
			}}
			columns={[
				{
					id: "stars",
					heading: m.stars(),
					render: (record) => record.stars,
				},
				{
					id: "name",
					heading: m.name(),
					render: (record) => record.name,
				},
				{
					id: "visible",
					heading: m.studio_field_visible(),
					render: (record) => (record.visible ? m.yes() : m.no()),
				},
			]}
		/>
	);
}

function ReviewFields({ values, onChange }: EditorFieldsProps<ReviewInput>) {
	return (
		<>
			<NumberField
				name="stars"
				label={m.stars()}
				value={values.stars}
				min={1}
				max={5}
				step={1}
				required
				onChange={(value) => onChange("stars", value ?? Number.NaN)}
			/>
			<InputField
				name="name"
				label={m.name()}
				value={values.name}
				required
				onChange={(event) => onChange("name", event.target.value)}
			/>
			<InputField
				name="description"
				label={m.description()}
				value={values.description}
				required
				render={<textarea rows={4} />}
				onChange={(event) => onChange("description", event.target.value)}
			/>
			<CheckboxField
				name="visible"
				label={m.studio_field_visible()}
				value={values.visible}
				onChange={(value) => onChange("visible", value)}
			/>
		</>
	);
}
