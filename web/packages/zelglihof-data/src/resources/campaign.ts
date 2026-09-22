import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofCampaign = {
	table: "zelglihof.campaign",
	columns: [
		{
			name: "subject",
			dataType: "text",
		},
		{
			name: "body",
			dataType: "text",
		},
		{
			name: "status",
			dataType: "text",
		},
	],
} as const satisfies ResourceDefinition;
