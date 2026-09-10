import { imageUrl } from "@oliumbi/assets/urls";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listPublicRecords } from "../content/public.functions";
import { AssetImage } from "./ui/asset-image";
import { Button } from "./ui/index";
export function PublicMembers() {
	const query = useInfiniteQuery({
		queryKey: ["members"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			listPublicRecords({
				data: { resource: "jublawoma.member", page: pageParam },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	return (
		<section className="shell pb-20">
			<h2 className="mb-8 text-4xl font-bold">
				{m.jublawoma_components_public_members_heading()}
			</h2>
			{query.isError ? <p role="alert">{m.error_generic()}</p> : null}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{query.data?.pages
					.flatMap((page) => page.items)
					.map((member) => (
						<article key={String(member.id)}>
							<AssetImage
								src={
									member.image_id
										? imageUrl(
												import.meta.env.VITE_ASSETS_PUBLIC_URL ??
													"http://localhost:8083",
												String(member.image_id),
											)
										: null
								}
								alt={String(member.name)}
								className="aspect-square rounded-3xl object-cover"
							/>
							<h3 className="mt-4 text-xl font-bold">{member.name}</h3>
							<p>{member.group_name}</p>
						</article>
					))}
			</div>
			{query.hasNextPage && (
				<Button
					className="button dark mt-8"
					disabled={query.isFetchingNextPage}
					onClick={() => {
						void query.fetchNextPage();
					}}
				>
					{m.load_more()}
				</Button>
			)}
		</section>
	);
}
