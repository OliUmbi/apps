import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaEvent = {
	table: "jublawoma.event",
	label: "Anlässe",
	fields: [
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
			name: "location",
			label: "location",
			kind: "text",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "starts_on",
			label: "starts on",
			kind: "date",
		},
		{
			name: "ends_on",
			label: "ends on",
			kind: "date",
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
