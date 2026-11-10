import { toAppError } from "@oliumbi/contracts";
import { createFileRoute } from "@tanstack/react-router";
import { getResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { login } from "../server/auth.server";

const loginSchema = z.object({
	username: z.string().min(1).max(100),
	password: z.string().min(1).max(1000),
});

// The browser's login form posts here instead of a server function so the
// reverse proxy can apply one rate limit to this exact path.
export const Route = createFileRoute("/api/session/login")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let payload: unknown;
				try {
					payload = await request.json();
				} catch {
					return Response.json({ error: "validation" }, { status: 400 });
				}
				const parsed = loginSchema.safeParse(payload);
				if (!parsed.success)
					return Response.json({ error: "validation" }, { status: 400 });
				try {
					const actor = await login(parsed.data.username, parsed.data.password);
					// `login` writes the session cookie onto the event response; a
					// successful handler response is not merged with it, so carry the
					// header over explicitly or the browser stays logged out.
					const setCookie = getResponseHeader("set-cookie");
					return Response.json(
						actor,
						setCookie ? { headers: { "Set-Cookie": setCookie } } : undefined,
					);
				} catch (error) {
					const failure = toAppError(error);
					const status =
						failure.code === "unauthorized"
							? 401
							: failure.code === "validation"
								? 400
								: 500;
					return Response.json({ error: failure.code }, { status });
				}
			},
		},
	},
});
