import type { ResourceDefinition } from "@oliumbi/contracts";
export const uncletShowcaseImage = {
	table: "unclet.showcase_image",
	label: "Einblickbilder",
	fields: [
		{
			name: "showcase_id",
			label: "showcase id",
			kind: "uuid",
		},
		{
			name: "image_id",
			label: "image id",
			kind: "uuid",
		},
		{
			name: "description",
			label: "description",
			kind: "text",
		},
	],
	public: "all",
	create: true,
	edit: true,
	delete: true,
	keys: ["showcase_id", "image_id"],
} as const satisfies ResourceDefinition;
