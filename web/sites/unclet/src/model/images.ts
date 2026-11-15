// Intrinsic dimensions keep layout stable while the responsive variants load.
// Bump imageVersion when a photo is replaced in place; versioned URLs are
// cached immutably at the edge.
export const imageVersion = "2026-11";

export const imageDimensions = {
	buffet: { width: 1600, height: 1067 },
	catering: { width: 1600, height: 1600 },
	coal: { width: 1200, height: 1600 },
	"event-table": { width: 1600, height: 1600 },
	fire: { width: 1067, height: 1600 },
	plating: { width: 1600, height: 1600 },
	"private-dinner": { width: 1600, height: 1067 },
	thomas: { width: 1600, height: 1600 },
} as const;

export type ImageName = keyof typeof imageDimensions;
