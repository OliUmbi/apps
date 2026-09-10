import type { ResourceDefinition } from "@oliumbi/contracts";
export const uncletReview = {
	table: "unclet.review",
	label: "Bewertungen",
	fields: [
		{
			name: "stars",
			label: "stars",
			kind: "number",
			integer: true,
			min: 1,
			max: 5,
		},
		{
			name: "name",
			label: "name",
			kind: "text",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
		{
			name: "visible",
			label: "visible",
			kind: "checkbox",
		},
	],
	public: "visible",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
