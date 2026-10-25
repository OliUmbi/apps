import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const repositoryDirectory = fileURLToPath(
	new URL("../../../../", import.meta.url),
);

/** Checked-in shared defaults live with the rest of the runtime config. */
const environmentDirectory = fileURLToPath(
	new URL("../../../../infrastructure/", import.meta.url),
);

export function environmentValues(
	mode: string,
	rootDirectory: string,
	siteDirectory: string,
) {
	// Precedence: site > shared defaults (infrastructure/) > root fallback.
	return {
		...loadEnv(mode, rootDirectory, ""),
		...loadEnv(mode, environmentDirectory, ""),
		...loadEnv(mode, siteDirectory, ""),
	};
}

/** Server-only values enter process.env; only VITE_ values are exposed to browser code. */
export function configureEnvironment(mode: string, siteConfigUrl: string) {
	const siteDirectory = fileURLToPath(new URL(".", siteConfigUrl));
	const values = environmentValues(mode, repositoryDirectory, siteDirectory);
	for (const [name, value] of Object.entries(values)) {
		if (process.env[name] === undefined) process.env[name] = value;
	}
	return { envDir: repositoryDirectory, envPrefix: "VITE_" };
}
