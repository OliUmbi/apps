import { m } from "@oliumbi/i18n/messages";
import { getLocale } from "@oliumbi/i18n/runtime";
import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import type { PublicShowcase } from "../model/content";
import { formatMonthYear } from "../model/dates";

export function ShowcaseFacts({ showcase }: { showcase: PublicShowcase }) {
	const publishedOn = showcase.publishedOn
		? formatMonthYear(showcase.publishedOn, getLocale())
		: null;
	const facts = [
		{ icon: UsersRound, label: m.guests(), value: showcase.guestCount },
		{ icon: MapPin, label: m.location(), value: showcase.location },
		{
			icon: CalendarDays,
			label: m.unclet_showcase_insight(),
			value: publishedOn,
		},
	].filter((fact) => fact.value);

	return (
		<dl className="my-8 grid gap-px overflow-hidden border border-bone/15 bg-bone/15 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
			{facts.map((fact) => (
				<div className="bg-night p-4" key={fact.label}>
					<dt className="flex items-center gap-2 font-mono text-[.65rem] tracking-[.14em] text-brass uppercase">
						<fact.icon size={14} />
						{fact.label}
					</dt>
					<dd className="mt-2 text-lg text-bone">{String(fact.value)}</dd>
				</div>
			))}
		</dl>
	);
}
