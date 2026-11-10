import { createServerFn } from "@tanstack/react-start";
import { currentActor, logout } from "./auth.server";

export const logoutFromStudio = createServerFn({ method: "POST" }).handler(
	logout,
);

export const getSession = createServerFn({ method: "GET" }).handler(
	currentActor,
);
