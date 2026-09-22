import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaEvent = {
	table: "jublawoma.event",
	columns: [
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "description",
			dataType: "text",
		},
		{
			name: "location",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "starts_on",
			dataType: "date",
		},
		{
			name: "ends_on",
			dataType: "date",
		},
	],
	public: "all",
} as const satisfies ResourceDefinition;
