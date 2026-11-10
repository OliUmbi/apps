import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { sitemapXml } from "@oliumbi/seo/sitemap";
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
				try {
					const repository = createPublicRepository(database.db);
					for (let page = 0; ; ) {
						const result = await repository.listStories(page);
						for (const story of result.items)
							urls.push(absolute(`/geschichten/${story.slug}`));
						if (result.nextPage === null) break;
						page = result.nextPage;
					}
				} catch (error) {
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
