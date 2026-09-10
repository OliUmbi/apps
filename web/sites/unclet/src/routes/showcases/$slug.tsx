import { imageUrl } from "@oliumbi/assets/urls";
import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AssetImage } from "../../components/ui/asset-image";
import { getPublicRecord } from "../../content/public.functions";
export const Route = createFileRoute("/showcases/$slug")({
	loader: async ({ params }) => {
		const result = await getPublicRecord({
			data: { resource: "unclet.showcase", value: params.slug, bySlug: true },
		});
		if (!result) throw notFound();
		return result;
	},
	component: Showcase,
});
function Showcase() {
	const { record, children } = Route.useLoaderData();
	const image = (id: unknown) =>
		imageUrl(
			import.meta.env.VITE_ASSETS_PUBLIC_URL ?? "http://localhost:8083",
			String(id),
		);
	return (
		<article className="shell py-20">
			<p className="eyebrow text-brass">
				{record.location} · {record.guest_count}
				{m.unclet_routes_showcases_slug_paragraph()}
			</p>
			<h1 className="display-title my-8 text-6xl">{record.title}</h1>
			<AssetImage
				src={record.image_id ? image(record.image_id) : null}
				alt={String(record.title)}
				className="max-h-[40rem] w-full object-cover"
			/>
			<p className="mx-auto max-w-3xl whitespace-pre-wrap py-12 text-lg leading-relaxed">
				{record.body}
			</p>
			<div className="grid gap-4 md:grid-cols-2">
				{children.map((item) => (
					<AssetImage
						key={String(item.image_id)}
						src={image(item.image_id)}
						alt={String(item.description)}
					/>
				))}
			</div>
		</article>
	);
}
