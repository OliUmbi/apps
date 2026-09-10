import type { ResourceDefinition } from "@oliumbi/contracts";
export const zelglihofSubscriber = {
	table: "zelglihof.subscriber",
	label: "Abonnenten",
	fields: [
		{
			name: "email",
			label: "email",
			kind: "email",
		},
		{
			name: "status",
			label: "status",
			kind: "text",
		},
		{
			name: "requested_at",
			label: "requested at",
			kind: "datetime-local",
		},
		{
			name: "confirmed_at",
			label: "confirmed at",
			kind: "datetime-local",
			nullable: true,
		},
		{
			name: "unsubscribed_at",
			label: "unsubscribed at",
			kind: "datetime-local",
			nullable: true,
		},
	],
	create: false,
	edit: false,
	delete: true,
} as const satisfies ResourceDefinition;
