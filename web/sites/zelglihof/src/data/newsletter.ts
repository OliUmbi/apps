import {
	newsletterSignupSchema,
	newsletterTokenSchema,
} from "@oliumbi/zelglihof-data/forms";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	confirmNewsletter,
	requestNewsletter,
	unsubscribeNewsletter,
} from "./newsletter.server";

export const signupForNewsletter = createServerFn({ method: "POST" })
	.validator(newsletterSignupSchema)
	.handler(({ data }) => requestNewsletter(data.email, data.website));

const tokenInput = z.object({ token: newsletterTokenSchema });

export const confirmNewsletterSignup = createServerFn({ method: "POST" })
	.validator(tokenInput)
	.handler(({ data }) => confirmNewsletter(data.token));

export const unsubscribeFromNewsletter = createServerFn({ method: "POST" })
	.validator(tokenInput)
	.handler(({ data }) => unsubscribeNewsletter(data.token));
