import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getLeadership, getMemberPage } from "../data/members";
import type { PublicMember } from "../model/content";
import { AssetImage } from "./asset-image";

export function PublicMembers() {
	return (
		<section className="shell pb-20">
			<Leadership />
			<MemberList />
		</section>
	);
}

function Leadership() {
	const query = useQuery({
		queryKey: ["leadership"],
		queryFn: () => getLeadership(),
	});
	if (query.isError) return <p role="alert">{m.error_generic()}</p>;
	if (!query.data?.length) return null;

	return (
		<div className="mb-16 border-y border-bark/15 py-10 md:grid md:grid-cols-[1fr_2fr] md:gap-10">
			<div>
				<p className="kicker">{m.jublawoma_leadership_eyebrow()}</p>
				<h2 className="mt-3 text-4xl font-bold">
					{m.jublawoma_leadership_title()}
				</h2>
			</div>
			<div className="mt-6 grid gap-3 text-2xl font-semibold md:mt-0">
				{query.data.map((member) => (
					<p className="m-0" key={member.id}>
						{member.name}
					</p>
				))}
			</div>
		</div>
	);
}

function MemberList() {
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
	if (query.isSuccess && members.length === 0) return null;

	return (
		<>
			<h2 className="mb-8 text-4xl font-bold">{m.jublawoma_team_title()}</h2>
			{query.isPending ? <p role="status">{m.loading()}</p> : null}
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
		</>
	);
}

function MemberCard({ member }: { member: PublicMember }) {
	return (
		<article>
			<AssetImage
				src={member.image?.src}
				alt={member.image?.alt || member.name}
				className="aspect-square rounded-3xl object-cover"
				sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
			/>
			<h3 className="mt-4 text-xl font-bold">{member.name}</h3>
			<p>
				{member.groupName}
				{member.leadership ? ` · ${m.jublawoma_leadership_title()}` : ""}
			</p>
		</article>
	);
}
