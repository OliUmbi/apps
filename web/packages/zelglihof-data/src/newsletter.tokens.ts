import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;
export const resendDelayMs = 5 * 60 * 1000;
export const confirmationLifetimeMs = 48 * 60 * 60 * 1000;
export const hashToken = (value: string) =>
	createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(TOKEN_BYTES).toString("base64url");
