import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { login, logout } from "./auth.server";

export const loginToStudio = createServerFn({ method: "POST" })
	.validator(
		z.object({
			username: z.string().min(1).max(100),
			password: z.string().min(1).max(1000),
		}),
	)
	.handler(async ({ data }) => login(data.username, data.password));

export const logoutFromStudio = createServerFn({ method: "POST" }).handler(
	logout,
);
