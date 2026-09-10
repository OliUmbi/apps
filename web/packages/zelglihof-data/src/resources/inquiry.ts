import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofInquiry = {
	table: "zelglihof.inquiry",
	label: "Anfragen",
	fields: [
		{
			name: "status",
			label: "status",
			kind: "status",
		},
		{
			name: "name",
			label: "name",
			kind: "text",
			readOnly: true,
		},
		{
			name: "phone",
			label: "phone",
			kind: "text",
			readOnly: true,
		},
		{
			name: "email",
			label: "email",
			kind: "email",
			nullable: true,
			readOnly: true,
		},
		{
			name: "message",
			label: "message",
			kind: "textarea",
			readOnly: true,
		},
	],
	create: false,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
