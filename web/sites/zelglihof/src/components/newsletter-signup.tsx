import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Mail } from "lucide-react";
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
				data: { email: String(formData.get("email") ?? ""), consent: true },
			});
			setState("sent");
		} catch {
			setState("error");
		}
	}
	return (
		<section
			id="newsletter"
			className="shell py-12 md:py-20"
			aria-labelledby="newsletter-title"
		>
			<div className="relative overflow-hidden rounded-[2rem] bg-clay px-7 py-12 text-cream md:px-12 md:py-16">
				<div className="absolute -right-20 -top-28 size-80 rounded-full border border-white/12" />
				<div className="absolute -bottom-28 right-24 size-64 rounded-full border border-white/12" />
				<div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
					<div>
						<span className="grid size-14 place-items-center rounded-full bg-sun text-ink">
							<Mail size={24} />
						</span>
						<p className="eyebrow mt-10 text-sun">Post vom Zelglihof</p>
						<h2
							id="newsletter-title"
							className="display-title mt-5 text-5xl md:text-6xl"
						>
							Erfahren, wenn es frisch ist.
						</h2>
						<p className="mt-5 max-w-lg leading-relaxed text-cream/72">
							Verkaufstermine, Saisonstart und Neues vom Hof. Selten gesendet,
							dafür dann, wenn es zählt.
						</p>
					</div>
					{state === "sent" ? (
						<div
							className="rounded-[1.5rem] bg-cream p-7 text-ink"
							role="status"
						>
							<Check className="text-moss" size={30} />
							<h3 className="mt-5 font-serif text-3xl font-bold">
								Fast geschafft.
							</h3>
							<p className="mt-3 text-ink/60">
								Bitte bestätige deine Anmeldung über den Link in der E-Mail.
							</p>
						</div>
					) : (
						<form
							action={submit}
							className="rounded-[1.5rem] bg-cream p-6 text-ink md:p-8"
						>
							<label className="field-label" htmlFor="newsletter-email">
								E-Mail-Adresse
								<input
									className="field-control"
									id="newsletter-email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="name@beispiel.ch"
									required
									maxLength={320}
								/>
							</label>
							<label className="mt-4 flex items-start gap-3 text-xs leading-relaxed text-ink/55">
								<input
									className="mt-0.5 size-4 accent-forest"
									name="consent"
									type="checkbox"
									required
								/>
								<span>
									Ich möchte Neuigkeiten erhalten und kann mich jederzeit
									kostenlos abmelden. Es gilt die{" "}
									<Link className="font-semibold underline" to="/datenschutz">
										Datenschutzerklärung
									</Link>
									.
								</span>
							</label>
							{state === "error" && (
								<p
									className="mt-4 rounded-xl bg-clay/10 p-3 text-sm text-clay"
									role="alert"
								>
									Das hat nicht geklappt. Bitte prüfe deine E-Mail-Adresse.
								</p>
							)}
							<button
								className="button-primary mt-6 w-full disabled:opacity-60"
								type="submit"
								disabled={state === "sending"}
							>
								{state === "sending" ? (
									"Wird gesendet …"
								) : (
									<>
										Newsletter abonnieren <ArrowRight size={17} />
									</>
								)}
							</button>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}
