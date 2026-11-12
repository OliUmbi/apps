// Cross-process lock that serializes every writer of the shared generated
// output (see config.mjs): `pnpm generate`, each running dev server and each
// build. mkdir() is atomic on all supported platforms, so the lock directory
// acts as the mutex. A lock older than STALE_LIMIT_MS is considered abandoned
// (for example after a killed process) and taken over.
import { mkdir, rename, rm, stat } from "node:fs/promises";
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
		// Checked before every attempt (including the abandoned-lock retry), so
		// a cleanup that keeps failing cannot spin forever.
		if (Date.now() > waitUntil) {
			throw new Error(
				`Timed out waiting for the message generation lock at ${lockDirectory}. Remove the directory if no generation is running.`,
			);
		}
		try {
			await mkdir(dirname(lockDirectory), { recursive: true });
			await mkdir(lockDirectory);
			break;
		} catch (error) {
			// Windows can report EPERM/EACCES when another process removes the
			// directory between our mkdir attempts. That is contention, not a
			// failure: retry it like EEXIST. ENOENT is the same race.
			if (!["EEXIST", "EPERM", "EACCES", "ENOENT"].includes(error?.code)) {
				throw error;
			}
			let abandoned = false;
			try {
				abandoned =
					Date.now() - (await stat(lockDirectory)).mtimeMs > STALE_LIMIT_MS;
			} catch (statError) {
				if (!["ENOENT", "EPERM", "EACCES"].includes(statError?.code)) {
					throw statError;
				}
			}
			if (abandoned) {
				// Rename first: only one waiter can move the abandoned lock
				// aside, so a second one cannot delete the fresh lock the winner
				// creates next.
				const stale = `${lockDirectory}.stale-${process.pid}-${Date.now()}`;
				try {
					await rename(lockDirectory, stale);
					await rm(stale, { recursive: true, force: true });
				} catch (renameError) {
					if (!["ENOENT", "EPERM", "EACCES"].includes(renameError?.code)) {
						throw renameError;
					}
					await sleep(100);
				}
				continue;
			}
			await sleep(100);
		}
	}
	try {
		return await run();
	} finally {
		// A failed cleanup must not turn a successful generation into a crash;
		// the next writer treats an old directory as abandoned.
		await rm(lockDirectory, { recursive: true, force: true }).catch(() => {});
	}
}
