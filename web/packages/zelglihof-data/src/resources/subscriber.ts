import type { ResourceDefinition } from "@oliumbi/contracts";

export const zelglihofSubscriber = {
	table: "zelglihof.subscriber",
	columns: [
		{
			name: "email",
			dataType: "text",
		},
		{
			name: "status",
			dataType: "text",
		},
		{
			name: "requested_at",
			dataType: "timestamp",
		},
		{
			name: "confirmed_at",
			dataType: "timestamp",
		},
		{
			name: "unsubscribed_at",
			dataType: "timestamp",
		},
	],
} as const satisfies ResourceDefinition;
