import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaPromotion = {
	table: "jublawoma.promotion",
	label: "Promotionen",
	fields: [
		{
			name: "title",
			label: "title",
			kind: "text",
		},
		{
			name: "description",
			label: "description",
			kind: "textarea",
		},
		{
			name: "link",
			label: "link",
			kind: "text",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "starts_at",
			label: "starts at",
			kind: "datetime-local",
		},
		{
			name: "ends_at",
			label: "ends at",
			kind: "datetime-local",
		},
	],
	public: "active",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
