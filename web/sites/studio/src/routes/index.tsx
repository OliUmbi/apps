import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, LockKeyhole } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { z } from "zod";
import { SiteOverview } from "../components/site-overview";
import { StudioShell } from "../components/studio-shell";
import {
	EventContentView,
	StoryContentView,
} from "../features/jublawoma/content-view";
import { InquiriesView } from "../features/unclet/inquiries-view";
import { NewsletterView } from "../features/zelglihof/newsletter-view";
import { loginToStudio, logoutFromStudio } from "../server/session.functions";
import { getStudioState } from "../server/studio.functions";
import { getSite, type SiteId, siteIds } from "../studio/config";

const studioSearch = z.object({
	site: z.enum(siteIds).catch("zelglihof"),
	section: z.string().catch("overview"),
});

export const Route = createFileRoute("/")({
	validateSearch: studioSearch,
	loader: () => getStudioState(),
	component: Studio,
});

function Studio() {
	const state = Route.useLoaderData();
	return state.actor && state.data ? (
		<Dashboard actor={state.actor} data={state.data} />
	) : (
		<Login />
	);
}

function Login() {
	const router = useRouter();
	const login = useServerFn(loginToStudio);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setError("");
		const form = new FormData(event.currentTarget);
		try {
			await login({
				data: {
					username: String(form.get("username")),
					password: String(form.get("password")),
				},
			});
			await router.invalidate();
		} catch {
			setError("Benutzername oder Passwort ist falsch.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="login-page">
			<div className="login-glow" />
			<section className="login-panel">
				<div className="login-brand">
					<span className="brand-mark large">O</span>
					<span>Oliumbi Studio</span>
				</div>
				<div className="login-copy">
					<p className="page-kicker">Geschützter Arbeitsbereich</p>
					<h1>Willkommen zurück</h1>
					<p>
						Melde dich an, um Inhalte, Anfragen und Abläufe deiner Websites zu
						verwalten.
					</p>
				</div>
				<form onSubmit={submit} className="login-form">
					<label>
						<span>Benutzername</span>
						<input name="username" autoComplete="username" required />
					</label>
					<label>
						<span>Passwort</span>
						<input
							name="password"
							type="password"
							autoComplete="current-password"
							required
						/>
					</label>
					{error ? (
						<p className="form-error" role="alert">
							{error}
						</p>
					) : null}
					<button
						type="submit"
						className="button primary login-button"
						disabled={busy}
					>
						{busy ? (
							"Wird angemeldet …"
						) : (
							<>
								Anmelden <ArrowRight size={15} />
							</>
						)}
					</button>
				</form>
				<footer className="login-footer">
					<LockKeyhole size={13} /> Sichere, widerrufbare Sitzung
				</footer>
			</section>
		</div>
	);
}

type StudioData = NonNullable<
	Awaited<ReturnType<typeof getStudioState>>["data"]
>;

function Dashboard({
	actor,
	data,
}: Readonly<{
	actor: { displayName: string; username: string };
	data: StudioData;
}>) {
	const router = useRouter();
	const logout = useServerFn(logoutFromStudio);
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const site = getSite(search.site);
	const validSection = site.sections.some((item) => item.id === search.section)
		? search.section
		: "overview";
	function selectSite(siteId: SiteId) {
		void navigate({ search: { site: siteId, section: "overview" } });
	}
	function selectSection(section: string) {
		void navigate({ search: { site: site.id, section } });
	}
	async function signOut() {
		await logout();
		await router.invalidate();
	}

	let content: ReactNode;
	if (site.id === "zelglihof" && validSection === "newsletter")
		content = (
			<NewsletterView
				subscribers={data.subscribers}
				failedMessages={data.failedMessages}
			/>
		);
	else if (site.id === "unclet" && validSection === "inquiries")
		content = <InquiriesView inquiries={data.uncletInquiries} />;
	else if (site.id === "jublawoma" && validSection === "events")
		content = <EventContentView events={data.jublawoma.events} />;
	else if (site.id === "jublawoma" && validSection === "stories")
		content = <StoryContentView stories={data.jublawoma.stories} />;
	else if (validSection === "overview")
		content = (
			<SiteOverview
				site={site}
				subscriberCount={site.id === "zelglihof" ? data.subscribers.length : 0}
				failedCount={data.failedMessages.length}
				inquiryCount={site.id === "unclet" ? data.uncletInquiries.length : 0}
				contentCount={
					site.id === "jublawoma"
						? data.jublawoma.events.length + data.jublawoma.stories.length
						: 0
				}
				onOpen={selectSection}
			/>
		);
	else
		content = (
			<PlannedFeature
				siteName={site.name}
				title={
					site.sections.find((item) => item.id === validSection)?.label ??
					"Bereich"
				}
			/>
		);

	return (
		<StudioShell
			site={site}
			section={validSection}
			actor={actor}
			onSelectSite={selectSite}
			onSelectSection={selectSection}
			onLogout={signOut}
		>
			{content}
		</StudioShell>
	);
}

function PlannedFeature({
	siteName,
	title,
}: Readonly<{ siteName: string; title: string }>) {
	return (
		<div className="content-stack">
			<header className="page-heading">
				<div>
					<p className="page-kicker">{siteName}</p>
					<h1>{title}</h1>
					<p>
						Dieser Arbeitsbereich erhält seinen Inhalt mit dem ersten echten
						Workflow.
					</p>
				</div>
			</header>
			<section className="panel planned-feature">
				<span className="planned-symbol">↗</span>
				<h2>Sauber vorbereitet, bewusst noch leer.</h2>
				<p>
					Navigation, Kontext und Seitenstruktur stehen. Datenmodell und
					Aktionen folgen zusammen, damit keine Oberfläche ohne klare Fachlogik
					entsteht.
				</p>
			</section>
		</div>
	);
}
