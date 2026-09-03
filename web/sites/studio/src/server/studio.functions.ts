import { createServerFn } from "@tanstack/react-start";
import { jublawomaOverview } from "../features/jublawoma/content.server";
import { listInquiries } from "../features/unclet/inquiries.server";
import { overview as newsletterOverview } from "../features/zelglihof/newsletter.server";
import { currentActor } from "./auth.server";

export const getStudioState = createServerFn({ method: "GET" }).handler(
	async () => {
		const actor = await currentActor();
		if (!actor) return { actor: null, data: null };
		const [newsletter, uncletInquiries, jublawoma] = await Promise.all([
			newsletterOverview(),
			listInquiries(),
			jublawomaOverview(),
		]);
		return { actor, data: { ...newsletter, uncletInquiries, jublawoma } };
	},
);
