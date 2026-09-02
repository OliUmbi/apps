import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { signupForNewsletter } from "../newsletter/newsletter.functions";

export function NewsletterSignup() {
	const signup = useServerFn(signupForNewsletter);
	const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
		"idle",
	);

	async function submit(formData: FormData) {
		setState("sending");
		try {
			await signup({
				data: {
					email: String(formData.get("email") ?? ""),
					locale: "de-CH",
					consent: true,
				},
			});
			setState("sent");
		} catch {
			setState("error");
		}
	}

	return (
		<section
			className="w-full max-w-4xl p-4 m-auto"
			aria-labelledby="newsletter-title"
		>
			<div className="rounded-2xl bg-emerald-950 px-6 py-8 text-stone-50 md:px-10">
				<h2 id="newsletter-title" className="text-3xl font-bold font-serif">
					Neuigkeiten vom Hof
				</h2>
				<p className="mt-2 max-w-2xl text-emerald-50">
					Erfahre, wann frische Produkte verfügbar sind und was auf dem
					Zelglihof läuft.
				</p>
				{state === "sent" ? (
					<p className="mt-6 rounded-lg bg-white/10 p-4" role="status">
						Fast geschafft: Bitte öffne die Bestätigungs-E-Mail. Falls die
						Adresse bereits angemeldet ist, ändert sich nichts.
					</p>
				) : (
					<form action={submit} className="mt-6 grid max-w-xl gap-4">
						<label
							className="grid gap-1 font-semibold"
							htmlFor="newsletter-email"
						>
							E-Mail-Adresse
							<input
								className="rounded-lg border border-emerald-700 bg-white px-3 py-2 text-stone-950"
								id="newsletter-email"
								name="email"
								type="email"
								autoComplete="email"
								required
								maxLength={320}
							/>
						</label>
						<label className="flex items-start gap-3 text-sm text-emerald-50">
							<input className="mt-1" name="consent" type="checkbox" required />
							<span>
								Ich möchte den Newsletter erhalten. Ich kann mich jederzeit
								kostenlos wieder abmelden. Es gilt die{" "}
								<Link className="underline" to="/privacy">
									Datenschutzerklärung
								</Link>
								.
							</span>
						</label>
						{state === "error" && (
							<p className="text-sm text-amber-200" role="alert">
								Das hat leider nicht funktioniert. Bitte prüfe deine Eingabe und
								versuche es erneut.
							</p>
						)}
						<button
							className="w-fit rounded-lg bg-amber-300 px-5 py-2 font-semibold text-stone-950 disabled:opacity-60"
							type="submit"
							disabled={state === "sending"}
						>
							{state === "sending"
								? "Wird gesendet …"
								: "Newsletter abonnieren"}
						</button>
					</form>
				)}
			</div>
		</section>
	);
}
