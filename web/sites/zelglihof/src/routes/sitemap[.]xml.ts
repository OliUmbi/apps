import { sitemapXml } from "@oliumbi/seo/sitemap";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import { createFileRoute } from "@tanstack/react-router";
import { sitemapPaths, siteOrigin } from "../model/seo";
import { database } from "../server/database.server";

function absolute(path: string) {
	return new URL(path, siteOrigin).href;
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const urls = sitemapPaths.map(absolute);
				const repository = createPublicRepository(database.db);
				try {
					for (let page = 0; ; ) {
						const result = await repository.listArticles(page, 100);
						for (const article of result.items)
							urls.push(absolute(`/aktuelles/${article.slug}`));
						if (result.nextPage === null) break;
						page = result.nextPage;
					}
					for (let page = 0; ; ) {
						const result = await repository.listProducts(page, 100);
						for (const product of result.items)
							urls.push(absolute(`/produkte/${product.id}`));
						if (result.nextPage === null) break;
						page = result.nextPage;
					}
				} catch (error) {
					// A sitemap with the static routes still beats a 500; the failed
					// content read is visible in the journal.
					console.error("sitemap content read failed", error);
				}
				return new Response(sitemapXml(urls), {
					headers: {
						"content-type": "application/xml; charset=utf-8",
						"cache-control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
