import {
	ArrowUpRight,
	CheckCircle2,
	CircleDashed,
	ExternalLink,
	MailWarning,
} from "lucide-react";
import type { StudioSite } from "../studio/config";

const descriptions: Record<string, string> = {
	zelglihof: "Hofladen, Inhalte und Kundenkontakte an einem Ort verwalten.",
	unclet:
		"Anfragen begleiten und ausgewählte kulinarische Arbeiten veröffentlichen.",
	jublawoma:
		"Anlässe, Geschichten, Mitglieder und Spendenaktionen koordinieren.",
	oliumbi: "Portfolio, Projekte und berufliches Profil aktuell halten.",
};

const upcoming: Record<string, { title: string; copy: string }[]> = {
	zelglihof: [
		{
			title: "Reservationen",
			copy: "Neue Produktreservationen prüfen und beantworten.",
		},
		{
			title: "Produkte & Angebote",
			copy: "Verfügbarkeit und begrenzte Online-Mengen verwalten.",
		},
		{ title: "Aktuelles", copy: "Beiträge entwerfen und veröffentlichen." },
	],
	unclet: [
		{
			title: "Anfragen",
			copy: "Anlassdaten, Kontakt und Bearbeitungsstatus bündeln.",
		},
		{
			title: "Einblicke",
			copy: "Vergangene Anlässe mit Bildern und Menüs kuratieren.",
		},
		{
			title: "Bewertungen",
			copy: "Freigaben und Herkunft transparent verwalten.",
		},
	],
	jublawoma: [
		{
			title: "Anlässe",
			copy: "Kalender und druckbare Jahresübersicht pflegen.",
		},
		{
			title: "Geschichten",
			copy: "Berichte und Lagergalerien veröffentlichen.",
		},
		{ title: "Spendenaktionen", copy: "Bedarf, Zusagen und Laufzeit steuern." },
	],
	oliumbi: [
		{
			title: "Projekte",
			copy: "Ausgewählte Arbeiten und Querverweise verwalten.",
		},
		{
			title: "Profil & CV",
			copy: "Erfahrung, Links und Kurzprofil aktualisieren.",
		},
	],
};

export function SiteOverview({
	site,
	subscriberCount,
	failedCount,
	inquiryCount,
	contentCount,
	onOpen,
}: Readonly<{
	site: StudioSite;
	subscriberCount: number;
	failedCount: number;
	inquiryCount: number;
	contentCount: number;
	onOpen: (section: string) => void;
}>) {
	const readyCount = site.sections.filter(
		(section) => section.status === "ready",
	).length;
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{site.domain}</p>
					<h1>{site.name}</h1>
					<p>{descriptions[site.id]}</p>
				</div>
				<a
					className="button secondary"
					href={`https://${site.domain}`}
					target="_blank"
					rel="noreferrer"
				>
					Website öffnen <ExternalLink size={14} />
				</a>
			</header>
			<div className="metric-grid">
				<Metric
					label="Bereiche bereit"
					value={`${readyCount}/${site.sections.length}`}
					detail="Schrittweise erweitert"
				/>
				<Metric
					label="Offene Aufgaben"
					value={String(site.sections.length - readyCount)}
					detail="Ohne leere Module"
				/>
				{site.id === "zelglihof" ? (
					<>
						<Metric
							label="Newsletter"
							value={String(subscriberCount)}
							detail="Kontakte insgesamt"
						/>
						<Metric
							label="Nachrichtenfehler"
							value={String(failedCount)}
							detail={failedCount ? "Benötigt Aufmerksamkeit" : "Alles ruhig"}
							alert={failedCount > 0}
						/>
					</>
				) : site.id === "unclet" ? (
					<Metric
						label="Anfragen"
						value={String(inquiryCount)}
						detail="Kontakte insgesamt"
					/>
				) : site.id === "jublawoma" ? (
					<Metric
						label="Inhalte"
						value={String(contentCount)}
						detail="Anlässe und Geschichten"
					/>
				) : (
					<Metric
						label="Status"
						value="Basis"
						detail="Bereit für den ersten Slice"
					/>
				)}
			</div>
			<section className="panel">
				<div className="panel-header">
					<div>
						<h2>Arbeitsbereiche</h2>
						<p>Nur fachliche Funktionen, die zur Website gehören.</p>
					</div>
				</div>
				<div className="module-list">
					{site.sections
						.filter((section) => section.id !== "overview")
						.map((section) => {
							const item = upcoming[site.id]?.find(
								(entry) => entry.title === section.label,
							);
							return (
								<button
									type="button"
									key={section.id}
									className="module-row"
									onClick={() => onOpen(section.id)}
								>
									<span
										className={
											section.status === "ready"
												? "module-icon ready"
												: "module-icon"
										}
									>
										{section.status === "ready" ? (
											<CheckCircle2 size={16} />
										) : (
											<CircleDashed size={16} />
										)}
									</span>
									<span className="min-w-0 flex-1 text-left">
										<strong>{section.label}</strong>
										<small>
											{item?.copy ??
												"Dieser Bereich wird mit seinem ersten echten Workflow ergänzt."}
										</small>
									</span>
									<span
										className={
											section.status === "ready"
												? "status-label ready"
												: "status-label"
										}
									>
										{section.status === "ready" ? "Bereit" : "Geplant"}
									</span>
									<ArrowUpRight size={14} className="text-faint" />
								</button>
							);
						})}
				</div>
			</section>
			<section className="panel compact-panel">
				<div>
					<p className="eyebrow">System</p>
					<h2 className="mt-2">Gemeinsame Dienste</h2>
				</div>
				<div className="service-status">
					<span>
						<i className="health-dot" /> Identität
					</span>
					<span>
						<i className="health-dot" /> Messaging
					</span>
					<span>
						<i className="health-dot" /> Datenbank
					</span>
					{failedCount > 0 ? (
						<span className="warning">
							<MailWarning size={14} /> {failedCount} fehlgeschlagen
						</span>
					) : null}
				</div>
			</section>
		</div>
	);
}

function Metric({
	label,
	value,
	detail,
	alert = false,
}: Readonly<{
	label: string;
	value: string;
	detail: string;
	alert?: boolean;
}>) {
	return (
		<div className={alert ? "metric-card alert" : "metric-card"}>
			<span>{label}</span>
			<strong>{value}</strong>
			<small>{detail}</small>
		</div>
	);
}
