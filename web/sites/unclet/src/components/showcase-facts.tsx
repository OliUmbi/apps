import type { ResourceRecord } from "@oliumbi/contracts";
import { CalendarDays, MapPin, UsersRound } from "lucide-react";

export function ShowcaseFacts({ record }: { record: ResourceRecord }) {
	const publishedOn = record.published_on
		? new Intl.DateTimeFormat("de-CH", {
				month: "long",
				year: "numeric",
			}).format(new Date(`${record.published_on}T12:00:00`))
		: null;
	const facts = [
		{ icon: UsersRound, label: "Gäste", value: record.guest_count },
		{ icon: MapPin, label: "Ort", value: record.location },
		{ icon: CalendarDays, label: "Einblick", value: publishedOn },
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
