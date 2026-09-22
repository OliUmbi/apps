import { Button } from "@base-ui/react/button";
import { publicImageUrl } from "@oliumbi/assets/urls";
import { m } from "@oliumbi/i18n/messages";
import type { Member } from "@oliumbi/jublawoma-data/content/member";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMemberPage } from "../data/members";
import { AssetImage } from "./asset-image";

export function PublicMembers() {
	const query = useInfiniteQuery({
		queryKey: ["members"],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getMemberPage({
				data: { page: pageParam },
			}),
		getNextPageParam: (page) => page.nextPage,
	});
	const members = query.data?.pages.flatMap((page) => page.items) ?? [];
	const leadership = members.filter((member) => member.leadership);

	return (
		<section className="shell pb-20">
			{leadership.length ? (
				<div className="mb-16 border-y border-bark/15 py-10 md:grid md:grid-cols-[1fr_2fr] md:gap-10">
					<div>
						<p className="kicker">{m.jublawoma_leadership_eyebrow()}</p>
						<h2 className="mt-3 text-4xl font-bold">
							{m.jublawoma_leadership_title()}
						</h2>
					</div>
					<div className="mt-6 grid gap-3 text-2xl font-semibold md:mt-0">
						{leadership.map((member) => (
							<p className="m-0" key={member.id}>
								{member.name}
							</p>
						))}
					</div>
				</div>
			) : null}
			<h2 className="mb-8 text-4xl font-bold">
				{m.jublawoma_components_public_members_heading()}
			</h2>
			{query.isError ? <p role="alert">{m.error_generic()}</p> : null}
			<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{members.map((member) => (
					<MemberCard key={member.id} member={member} />
				))}
			</div>
			{query.hasNextPage ? (
				<Button
					className="button dark mt-8"
					disabled={query.isFetchingNextPage}
					onClick={() => void query.fetchNextPage()}
				>
					{m.load_more()}
				</Button>
			) : null}
		</section>
	);
}

function MemberCard({ member }: { member: Member }) {
	return (
		<article>
			<AssetImage
				src={member.imageId ? publicImageUrl(member.imageId) : null}
				alt={member.name}
				className="aspect-square rounded-3xl object-cover"
			/>
			<h3 className="mt-4 text-xl font-bold">{member.name}</h3>
			<p>
				{member.groupName}
				{member.leadership ? ` · ${m.jublawoma_leadership_title()}` : ""}
			</p>
		</article>
	);
}
