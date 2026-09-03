export const products = [
	{
		id: "rindfleisch",
		name: "Mägenwiler Beef",
		shortName: "Rindfleisch",
		eyebrow: "Nächste Abgabe · Herbst",
		description:
			"Mischpakete mit sorgfältig ausgewählten Stücken unserer eigenen Mutterkühe.",
		longDescription:
			"Unsere F1-Mutterkühe aus Limousin, Angus und Simmentaler wachsen auf dem Zelglihof auf. Das Fleisch wird in gemischten Paketen angeboten und nach der Verarbeitung direkt auf dem Hof abgeholt.",
		image: "/images/demo/demo-rindfleisch.jpg",
		availability: "Vorbestellung offen",
		kind: "reservable" as const,
		variants: [
			{ id: "rindfleisch-5kg", name: "Mischpaket · ca. 5 kg" },
			{ id: "rindfleisch-10kg", name: "Mischpaket · ca. 10 kg" },
			{ id: "rindfleisch-15kg", name: "Familienpaket · ca. 15 kg" },
		],
	},
	{
		id: "eier",
		name: "Frische Eier",
		shortName: "Eier",
		eyebrow: "Täglich im Hofladen",
		description:
			"Eier unserer Hühner, direkt ab Hof und solange der Tagesvorrat reicht.",
		longDescription:
			"Unsere Eier findest du täglich im kleinen Hofladen. Weil Hühner ihren eigenen Rhythmus haben, kann die verfügbare Menge variieren.",
		image: "/images/demo/demo-eier.jpg",
		availability: "Direkt erhältlich",
		kind: "shop" as const,
		variants: [
			{ id: "eier-6", name: "6er-Schachtel" },
			{ id: "eier-10", name: "10er-Schachtel" },
			{ id: "eier-30", name: "30er-Lage" },
		],
	},
	{
		id: "zuckermais",
		name: "Zuckermais",
		shortName: "Zuckermais",
		eyebrow: "Saisonal · Sommer",
		description:
			"Knackig, süss und frisch vom Feld – verfügbar, sobald die Kolben reif sind.",
		longDescription:
			"Unser Zuckermais wird reif geerntet und kommt ohne Umwege in den Hofladen. Den genauen Verkaufsstart kündigen wir unter Aktuelles und im Newsletter an.",
		image: "/images/demo/demo-zuckermais.jpg",
		availability: "Saison beendet",
		kind: "seasonal" as const,
		variants: [
			{ id: "zuckermais-1", name: "Einzelner Kolben" },
			{ id: "zuckermais-5", name: "Bund à 5 Kolben" },
		],
	},
	{
		id: "bohnen",
		name: "Grüne Bohnen",
		shortName: "Bohnen",
		eyebrow: "Saisonal · Sommer",
		description: "Frisch geerntete Bohnen aus unseren Spezialkulturen.",
		longDescription:
			"Die Bohnen werden während eines kurzen Erntefensters angeboten. Der Newsletter informiert dich, sobald sie im Hofladen bereitliegen.",
		image: "/images/demo/demo-bohnen.jpg",
		availability: "Aktuell nicht erhältlich",
		kind: "seasonal" as const,
		variants: [
			{ id: "bohnen-500g", name: "500 g" },
			{ id: "bohnen-1kg", name: "1 kg" },
		],
	},
] as const;

export type Product = (typeof products)[number];

export const updates = [
	{
		slug: "rindfleisch-herbst",
		date: "12. September 2026",
		category: "Hofverkauf",
		title: "Die nächste Fleischabgabe ist in Vorbereitung",
		description:
			"Reserviere dir dein gewünschtes Paket vom Mägenwiler Beef und geniesse Fleischqualität aus unserer Region.",
		image: "/images/demo/demo-rindfleisch.jpg",
		productId: "rindfleisch",
	},
	{
		slug: "zuckermais-ab-hof",
		date: "18. August 2026",
		category: "Saison",
		title: "Zuckermais frisch ab Feld",
		description:
			"Die ersten Kolben sind reif. Für kurze Zeit findest du unseren Zuckermais täglich im Hofladen.",
		image: "/images/demo/demo-zuckermais.jpg",
		productId: "zuckermais",
	},
	{
		slug: "aussaat-spezialkulturen",
		date: "22. April 2026",
		category: "Vom Feld",
		title: "Die neue Saison beginnt",
		description:
			"Mit der Aussaat von Mais und Spezialkulturen beginnt auf unseren Feldern ein neues Landwirtschaftsjahr.",
		image: "/images/demo/demo-saat.jpg",
		productId: null,
	},
] as const;

export type Update = (typeof updates)[number];
export function findProduct(id: string) {
	return products.find((product) => product.id === id);
}
export function findUpdate(slug: string) {
	return updates.find((update) => update.slug === slug);
}
