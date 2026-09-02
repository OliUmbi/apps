import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { confirmNewsletterSignup } from "../../../newsletter/newsletter.functions";

export const Route = createFileRoute("/newsletter/bestaetigen/$token")({
	component: ConfirmPage,
});

function ConfirmPage() {
	const { token } = Route.useParams();
	const confirm = useServerFn(confirmNewsletterSignup);
	const [result, setResult] = useState<string>();

	async function submit() {
		try {
			const response = await confirm({ data: { token } });
			setResult(response.outcome);
		} catch {
			setResult("error");
		}
	}

	const message =
		result === "confirmed" || result === "already-confirmed"
			? "Deine Anmeldung ist bestätigt. Schön, dass du dabei bist!"
			: result === "expired"
				? "Dieser Link ist abgelaufen. Melde dich auf der Startseite erneut an."
				: result
					? "Dieser Bestätigungslink ist ungültig."
					: null;

	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="font-serif text-4xl font-bold">Newsletter bestätigen</h1>
			{message ? (
				<p className="mt-6" role="status">
					{message}
				</p>
			) : (
				<>
					<p className="mt-4 text-stone-600">
						Mit einem Klick bestätigst du deine Anmeldung.
					</p>
					<button
						className="mt-8 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white"
						onClick={submit}
						type="button"
					>
						Anmeldung bestätigen
					</button>
				</>
			)}
		</section>
	);
}
