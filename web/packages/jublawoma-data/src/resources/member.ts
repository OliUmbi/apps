import type { ResourceDefinition } from "@oliumbi/contracts";
export const jublawomaMember = {
	table: "jublawoma.member",
	label: "Leitungsteam",
	fields: [
		{
			name: "name",
			label: "name",
			kind: "text",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
			nullable: true,
		},
		{
			name: "group_name",
			label: "group name",
			kind: "text",
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
