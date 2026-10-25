// Cross-process lock that serializes every writer of the shared generated
// output (see config.mjs): `pnpm generate`, each running dev server and each
// build. mkdir() is atomic on all supported platforms, so the lock directory
// acts as the mutex. A lock older than STALE_LIMIT_MS is considered abandoned
// (for example after a killed process) and taken over.
import { mkdir, rm, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const lockDirectory = fileURLToPath(
	new URL("./project.inlang/cache/generation.lock", import.meta.url),
);

const STALE_LIMIT_MS = 60_000;
const WAIT_LIMIT_MS = 120_000;

export async function withGenerationLock(run) {
	const waitUntil = Date.now() + WAIT_LIMIT_MS;
	for (;;) {
		try {
			await mkdir(dirname(lockDirectory), { recursive: true });
			await mkdir(lockDirectory);
			break;
		} catch (error) {
			if (error?.code !== "EEXIST") {
				throw error;
			}
			let abandoned = false;
			try {
				abandoned =
					Date.now() - (await stat(lockDirectory)).mtimeMs > STALE_LIMIT_MS;
			} catch (statError) {
				if (statError?.code !== "ENOENT") {
					throw statError;
				}
			}
			if (abandoned) {
				await rm(lockDirectory, { recursive: true, force: true });
				continue;
			}
			if (Date.now() > waitUntil) {
				throw new Error(
					`Timed out waiting for the message generation lock at ${lockDirectory}. Remove the directory if no generation is running.`,
				);
			}
			await sleep(100);
		}
	}
	try {
		return await run();
	} finally {
		await rm(lockDirectory, { recursive: true, force: true });
	}
}
