import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useState } from "react";
import type { PublicMember } from "../model/content";
import { MediaImage } from "./media-image";

// A club roster can reach fifty people. Members start as a short directory and
// only expand on request, so the About page never becomes an endless photo
// wall; the compact rows keep even the expanded list scannable.
const collapsedMemberCount = 12;
const memberGridId = "team-grid";

export function PublicMembers({
	leadership,
	members,
}: {
	leadership: PublicMember[] | null;
	members: PublicMember[];
}) {
	return (
		<section className="shell pb-20">
			<Leadership members={leadership} />
			<MemberList members={members} />
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
		<div className="mb-16 border-y border-ink/15 py-10 md:grid md:grid-cols-[1fr_2fr] md:gap-10">
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

function MemberList({ members }: { members: PublicMember[] }) {
	const [expanded, setExpanded] = useState(false);
	if (members.length === 0) return null;
	const visible = expanded ? members : members.slice(0, collapsedMemberCount);

	return (
		<section aria-labelledby="team-title">
			<h2 id="team-title" className="mb-8 text-4xl font-bold">
				{m.jublawoma_team_title()}
			</h2>
			<div
				id={memberGridId}
				className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
			>
				{visible.map((member) => (
					<MemberCard key={member.id} member={member} />
				))}
			</div>
			{members.length > collapsedMemberCount && (
				<Button
					className="button dark mt-8"
					type="button"
					aria-expanded={expanded}
					aria-controls={memberGridId}
					onClick={() => setExpanded((value) => !value)}
				>
					{expanded
						? m.jublawoma_members_show_less()
						: m.jublawoma_members_show_all({ count: members.length })}
				</Button>
			)}
		</section>
	);
}

function MemberCard({ member }: { member: PublicMember }) {
	return (
		<article className="flex items-center gap-4 rounded-2xl border border-line p-4">
			<MediaImage
				src={member.image?.src}
				alt={member.image?.alt || member.name}
				seed={member.id}
				className="size-16 shrink-0 rounded-full object-cover"
				sizes="64px"
			/>
			<div className="min-w-0">
				<h3 className="truncate text-base font-bold">{member.name}</h3>
				<p className="text-sm text-ink-soft">
					{member.leadership
						? m.jublawoma_member_line({
								group: member.groupName,
								role: m.jublawoma_leadership_title(),
							})
						: member.groupName}
				</p>
			</div>
		</article>
	);
}
