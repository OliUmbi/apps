import type { Product } from "@oliumbi/zelglihof-data/content.types";
import { AssetImage } from "./ui/asset-image";

export function ProductVariants({ product }: { product: Product }) {
	return (
		<section className="shell grid gap-6 py-8 md:grid-cols-2">
			{product.variants.map((variant) => (
				<article
					key={variant.id}
					className="rounded-3xl border border-forest/15 p-6"
				>
					{variant.image && (
						<AssetImage
							src={variant.image}
							alt={variant.name}
							className="mb-5 aspect-[4/3] w-full rounded-2xl object-cover"
						/>
					)}
					<h2 className="font-serif text-2xl font-bold">{variant.name}</h2>
					<p className="mt-2 font-semibold text-clay">{variant.price}</p>
					<p className="mt-3 whitespace-pre-wrap text-ink/65">
						{variant.description}
					</p>
				</article>
			))}
		</section>
	);
}
