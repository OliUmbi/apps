// Intrinsic dimensions keep layout stable while the responsive variants load.
// Bump imageVersion when a photo is replaced in place; the URLs are cached
// immutably at the edge.
export const imageVersion = "2026-11";

export const imageDimensions = {
	"broccoli-ernte-feld": { width: 1536, height: 2048 },
	"broccoli-ernte-kiste": { width: 1600, height: 1200 },
	"broccoli-ernte-team": { width: 1600, height: 1200 },
	"broccoli-pflanze": { width: 2048, height: 2048 },
	"broccoli-pflanzung": { width: 1536, height: 2048 },
	"jungrinder-weide": { width: 1500, height: 2000 },
	"kuh-mit-kalb": { width: 1500, height: 2000 },
	"rinder-herde": { width: 2048, height: 1536 },
	"spinat-beregnung": { width: 1600, height: 1200 },
	"spinat-feld": { width: 1600, height: 1200 },
	"zuckermais-beregnung-haspel": { width: 2048, height: 1536 },
	"zuckermais-beregnung-sprenger": { width: 1500, height: 2000 },
	"zuckermais-beregnung-traktor": { width: 1536, height: 2048 },
	"zuckermais-mulchfeld": { width: 2048, height: 1536 },
	"zuckermais-mulchfolie": { width: 1536, height: 2048 },
} as const;

export type ImageName = keyof typeof imageDimensions;
