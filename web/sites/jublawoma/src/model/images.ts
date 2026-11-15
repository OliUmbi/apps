// Intrinsic dimensions keep layout stable while the responsive variants load.
// Bump imageVersion when a photo is replaced in place; versioned URLs are
// cached immutably at the edge.
export const imageVersion = "2026-11";

export const imageDimensions = {
	leiter: { width: 1600, height: 1067 },
	scharleitung: { width: 1600, height: 1066 },
} as const;

export type ImageName = keyof typeof imageDimensions;
