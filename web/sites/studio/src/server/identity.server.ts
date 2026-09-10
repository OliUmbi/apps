import { createIdentityClient } from "@oliumbi/identity";

export const identity = createIdentityClient({
	baseUrl: () => process.env.IDENTITY_SERVICE_URL ?? "http://localhost:8081",
	token: () => process.env.IDENTITY_INTERNAL_AUTHORIZATION_TOKEN,
});
