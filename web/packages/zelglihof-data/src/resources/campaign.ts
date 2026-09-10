import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofCampaign = {
	table: "zelglihof.campaign",
	label: "Kampagnen",
	fields: [
		{
			name: "subject",
			label: "subject",
			kind: "text",
		},
		{
			name: "body",
			label: "body",
			kind: "textarea",
		},
		{
			name: "status",
			label: "status",
			kind: "text",
			readOnly: true,
		},
	],
	createDefaults: { status: "draft" },
	editableWhen: { field: "status", value: "draft" },
	create: true,
	edit: true,
	delete: true,
} as const satisfies ResourceDefinition;
