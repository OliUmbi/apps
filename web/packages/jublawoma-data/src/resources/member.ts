import type { ResourceDefinition } from "@oliumbi/contracts";

export const jublawomaMember = {
	table: "jublawoma.member",
	columns: [
		{
			name: "name",
			dataType: "text",
		},
		{
			name: "image_id",
			dataType: "uuid",
		},
		{
			name: "group_name",
			dataType: "text",
		},
		{
			name: "leadership",
			dataType: "boolean",
		},
	],
	public: "all",
} as const satisfies ResourceDefinition;
