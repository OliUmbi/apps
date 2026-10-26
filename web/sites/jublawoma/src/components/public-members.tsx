import { Button } from "@base-ui/react/button";
import type { Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { PaginatedList } from "@oliumbi/ui/paginated-list";
import { getMemberPage } from "../data/members";
import type { PublicMember } from "../model/content";
import { MediaImage } from "./media-image";

export function PublicMembers({
	leadership,
	memberPage,
}: {
	leadership: PublicMember[] | null;
	memberPage: Page<PublicMember>;
}) {
	return (
		<section className="shell pb-20">
			<Leadership members={leadership} />
			<MemberList initialPage={memberPage} />
		</section>
	);
}

function Leadership({ members }: { members: PublicMember[] | null }) {
	// The route loader seeds this list; `null` marks a failed load (J-07).
	if (members === null)
		return (
			<p role="alert" className="mb-16">
				{m.error_generic()}
			</p>
		);
	if (!members.length) return null;

	return (
		<div className="mb-16 border-y border-bark/15 py-10 md:grid md:grid-cols-[1fr_2fr] md:gap-10">
			<div>
				<p className="kicker">{m.jublawoma_leadership_eyebrow()}</p>
				<h2 className="mt-3 text-4xl font-bold">
					{m.jublawoma_leadership_title()}
				</h2>
			</div>
			<div className="mt-6 grid gap-3 text-2xl font-semibold md:mt-0">
				{members.map((member) => (
					<p className="m-0" key={member.id}>
						{member.name}
					</p>
				))}
			</div>
		</div>
	);
}

function MemberList({ initialPage }: { initialPage: Page<PublicMember> }) {
	return (
		<PaginatedList
			queryKey={["members"]}
			initialPage={initialPage}
			load={(page) => getMemberPage({ data: { page } })}
			emptyState={null}
			footer={({ loadMore, isFetchingNextPage }) => (
				<Button
					className="button dark mt-8"
					disabled={isFetchingNextPage}
					onClick={loadMore}
				>
					{m.load_more()}
				</Button>
			)}
		>
			{(members) =>
				members.length === 0 ? null : (
					<>
						<h2 className="mb-8 text-4xl font-bold">
							{m.jublawoma_team_title()}
						</h2>
						<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							{members.map((member) => (
								<MemberCard key={member.id} member={member} />
							))}
						</div>
					</>
				)
			}
		</PaginatedList>
	);
}

function MemberCard({ member }: { member: PublicMember }) {
	return (
		<article>
			<MediaImage
				src={member.image?.src}
				alt={member.image?.alt || member.name}
				seed={member.id}
				className="aspect-square rounded-3xl object-cover"
				sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
			/>
			<h3 className="mt-4 text-xl font-bold">{member.name}</h3>
			<p>
				{member.leadership
					? m.jublawoma_member_line({
							group: member.groupName,
							role: m.jublawoma_leadership_title(),
						})
					: member.groupName}
			</p>
		</article>
	);
}
