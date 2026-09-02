import type { Subscriber } from "@oliumbi/newsletter";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { StudioActionInput } from "../server/functions";
import {
	getStudioState,
	loginToStudio,
	logoutFromStudio,
	performStudioAction,
} from "../server/functions";

export const Route = createFileRoute("/")({
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
		<div className="grid min-h-screen place-items-center px-4">
			<form
				onSubmit={submit}
				className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
			>
				<p className="text-sm font-semibold uppercase tracking-widest text-emerald-800">
					Oliumbi
				</p>
				<h1 className="mt-2 text-3xl font-bold">Studio</h1>
				<p className="mt-2 text-sm text-stone-600">
					Melde dich an, um den Newsletter zu verwalten.
				</p>
				<label className="mt-6 grid gap-1 text-sm font-semibold">
					Benutzername
					<input
						className="rounded-lg border border-stone-300 px-3 py-2"
						name="username"
						autoComplete="username"
						required
					/>
				</label>
				<label className="mt-4 grid gap-1 text-sm font-semibold">
					Passwort
					<input
						className="rounded-lg border border-stone-300 px-3 py-2"
						name="password"
						type="password"
						autoComplete="current-password"
						required
					/>
				</label>
				{error && (
					<p className="mt-4 text-sm text-red-700" role="alert">
						{error}
					</p>
				)}
				<button
					type="submit"
					className="mt-6 w-full rounded-lg bg-emerald-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
					disabled={busy}
				>
					{busy ? "Wird angemeldet …" : "Anmelden"}
				</button>
			</form>
		</div>
	);
}

type StudioData = NonNullable<
	Awaited<ReturnType<typeof getStudioState>>["data"]
>;

function Dashboard({
	actor,
	data,
}: {
	actor: { displayName: string };
	data: StudioData;
}) {
	const router = useRouter();
	const logout = useServerFn(logoutFromStudio);
	const action = useServerFn(performStudioAction);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [notice, setNotice] = useState("");
	const [busy, setBusy] = useState<string>();

	const subscribers = useMemo(
		() =>
			data.subscribers.filter(
				(subscriber) =>
					subscriber.email.toLowerCase().includes(search.toLowerCase()) &&
					(status === "all" || subscriber.status === status),
			),
		[data.subscribers, search, status],
	);

	async function run(
		input: Parameters<typeof action>[0]["data"],
		message: string,
	) {
		setBusy(input.id);
		setNotice("");
		try {
			await action({ data: input });
			setNotice(message);
			await router.invalidate();
		} catch (error) {
			setNotice(
				error instanceof Error
					? error.message
					: "Die Änderung ist fehlgeschlagen.",
			);
		} finally {
			setBusy(undefined);
		}
	}

	return (
		<div className="min-h-screen">
			<header className="border-b border-stone-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
							Oliumbi
						</p>
						<h1 className="text-2xl font-bold">Studio</h1>
					</div>
					<div className="flex items-center gap-4 text-sm">
						<span>{actor.displayName}</span>
						<button
							type="button"
							className="rounded-lg border px-3 py-2"
							onClick={async () => {
								await logout();
								await router.invalidate();
							}}
						>
							Abmelden
						</button>
					</div>
				</div>
			</header>
			<div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
				{notice && (
					<p
						className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm"
						role="status"
					>
						{notice}
					</p>
				)}
				<section>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<h2 className="text-2xl font-bold">Newsletter</h2>
							<p className="text-sm text-stone-600">
								{data.subscribers.length} Einträge
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<input
								className="rounded-lg border border-stone-300 bg-white px-3 py-2"
								placeholder="E-Mail suchen"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
							<select
								className="rounded-lg border border-stone-300 bg-white px-3 py-2"
								value={status}
								onChange={(event) => setStatus(event.target.value)}
							>
								<option value="all">Alle</option>
								<option value="pending">Ausstehend</option>
								<option value="active">Aktiv</option>
								<option value="unsubscribed">Abgemeldet</option>
							</select>
						</div>
					</div>
					<div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white">
						<table className="w-full min-w-4xl text-left text-sm">
							<thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
								<tr>
									<th className="p-3">E-Mail</th>
									<th className="p-3">Status</th>
									<th className="p-3">Einwilligung</th>
									<th className="p-3">Aktionen</th>
								</tr>
							</thead>
							<tbody>
								{subscribers.map((subscriber) => (
									<SubscriberRow
										key={subscriber.id}
										subscriber={subscriber}
										busy={busy === subscriber.id}
										run={run}
									/>
								))}
							</tbody>
						</table>
					</div>
				</section>
				<section>
					<h2 className="text-2xl font-bold">Fehlgeschlagene E-Mails</h2>
					{data.failedMessages.length === 0 ? (
						<p className="mt-3 rounded-xl border border-stone-200 bg-white p-5 text-stone-600">
							Keine fehlgeschlagenen Zustellungen.
						</p>
					) : (
						<div className="mt-3 space-y-2">
							{data.failedMessages.map((message) => (
								<div
									className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white p-4"
									key={message.id}
								>
									<div>
										<p className="font-semibold">{message.recipientEmail}</p>
										<p className="text-sm text-stone-600">
											{message.messageType} · {message.attemptCount} Versuche
										</p>
										<p className="mt-1 max-w-3xl text-xs text-red-700">
											{message.lastError}
										</p>
									</div>
									<button
										type="button"
										className="rounded-lg border px-3 py-2"
										onClick={() =>
											run(
												{ action: "retry-message", id: message.id },
												"E-Mail wird erneut versucht.",
											)
										}
									>
										Erneut versuchen
									</button>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

function SubscriberRow({
	subscriber,
	busy,
	run,
}: {
	subscriber: Subscriber;
	busy: boolean;
	run: (input: StudioActionInput, message: string) => Promise<void>;
}) {
	const [email, setEmail] = useState(subscriber.email);
	return (
		<tr className="border-t border-stone-100 align-top">
			<td className="p-3">
				<input
					className="w-64 rounded border border-stone-300 px-2 py-1"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
				/>
				<p className="mt-1 text-xs text-stone-500">
					{subscriber.locale.toUpperCase()}
				</p>
			</td>
			<td className="p-3">
				<Status value={subscriber.status} />
			</td>
			<td className="p-3 text-stone-600">
				{new Date(subscriber.requestedAt).toLocaleString("de-CH")}
				<br />
				<span className="text-xs">{subscriber.consentSource}</span>
			</td>
			<td className="p-3">
				<div className="flex max-w-md flex-wrap gap-2">
					{email !== subscriber.email && (
						<button
							type="button"
							disabled={busy}
							className="rounded border px-2 py-1"
							onClick={() =>
								run(
									{ action: "correct", id: subscriber.id, email },
									"Adresse geändert; Bestätigung versendet.",
								)
							}
						>
							Adresse speichern
						</button>
					)}
					{subscriber.status === "pending" && (
						<button
							type="button"
							disabled={busy}
							className="rounded border px-2 py-1"
							onClick={() =>
								run(
									{ action: "resend", id: subscriber.id },
									"Bestätigung erneut versendet.",
								)
							}
						>
							Bestätigung senden
						</button>
					)}
					{subscriber.status !== "unsubscribed" && (
						<button
							type="button"
							disabled={busy}
							className="rounded border px-2 py-1"
							onClick={() =>
								run(
									{ action: "unsubscribe", id: subscriber.id },
									"Abonnement beendet.",
								)
							}
						>
							Abmelden
						</button>
					)}
					<button
						type="button"
						disabled={busy}
						className="rounded border border-red-300 px-2 py-1 text-red-800"
						onClick={() =>
							window.confirm(
								"Eintrag und zugehörige E-Mail-Daten endgültig löschen?",
							) &&
							run({ action: "delete", id: subscriber.id }, "Eintrag gelöscht.")
						}
					>
						Löschen
					</button>
				</div>
			</td>
		</tr>
	);
}

function Status({ value }: { value: Subscriber["status"] }) {
	const labels = {
		pending: "Ausstehend",
		active: "Aktiv",
		unsubscribed: "Abgemeldet",
	};
	const colors = {
		pending: "bg-amber-100 text-amber-900",
		active: "bg-emerald-100 text-emerald-900",
		unsubscribed: "bg-stone-200 text-stone-700",
	};
	return (
		<span
			className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[value]}`}
		>
			{labels[value]}
		</span>
	);
}
