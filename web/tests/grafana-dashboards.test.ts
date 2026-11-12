import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

/*
 * Grafana dashboards are code: Ansible copies them to the host and Grafana
 * loads them on start, where malformed JSON or a stale datasource uid only
 * surfaces as an empty panel after a deploy. These checks run in the web suite
 * so a committed dashboard is validated before it ships.
 */

const provisioning = fileURLToPath(
	new URL(
		"../../infrastructure/monitoring/grafana/provisioning",
		import.meta.url,
	),
);

interface Panel {
	id: number;
	title?: string;
	gridPos?: { x: number; y: number; w: number; h: number };
	targets?: Array<{
		expr?: string;
		datasource?: { uid?: string };
	}>;
}

interface Dashboard {
	uid?: string;
	title?: string;
	schemaVersion?: number;
	panels?: Panel[];
}

function loadDashboard(file: string): Dashboard {
	const source = readFileSync(`${provisioning}/dashboards/${file}`, "utf8");
	try {
		return JSON.parse(source) as Dashboard;
	} catch (error) {
		throw new Error(`${file} is not valid JSON`, { cause: error });
	}
}

const dashboards = readdirSync(`${provisioning}/dashboards`)
	.filter((file) => file.endsWith(".json"))
	.map((file) => ({ file, dashboard: loadDashboard(file) }));

test("the dashboard provider and datasource are provisioned", () => {
	assert.ok(dashboards.length > 0);
	const provider = readFileSync(
		`${provisioning}/dashboards/dashboards.yml`,
		"utf8",
	);
	assert.match(
		provider,
		/path: \/etc\/grafana\/provisioning\/dashboards/,
		"the provider scans the mounted dashboard directory",
	);
	assert.match(provider, /allowUiUpdates: false/, "UI edits stay disabled");
	assert.match(provider, /disableDeletion: true/, "deletion stays disabled");
	const datasource = readFileSync(
		`${provisioning}/datasources/prometheus.yml`,
		"utf8",
	);
	assert.match(
		datasource,
		/^\s+uid: prometheus$/m,
		"the datasource keeps the uid the dashboards reference",
	);
});

test("every dashboard is valid JSON with unique ids and the fixed datasource", () => {
	const uids = new Set<string>();
	for (const { file, dashboard } of dashboards) {
		assert.ok(dashboard.uid, `${file} declares a uid`);
		assert.ok(!uids.has(dashboard.uid), `${file} reuses uid ${dashboard.uid}`);
		uids.add(dashboard.uid);
		assert.ok(dashboard.title, `${file} declares a title`);
		assert.ok(dashboard.schemaVersion, `${file} declares a schemaVersion`);

		const panels = dashboard.panels ?? [];
		const panelIds = new Set<number>();
		for (const panel of panels) {
			assert.ok(!panelIds.has(panel.id), `${file} reuses panel id ${panel.id}`);
			panelIds.add(panel.id);

			const position = panel.gridPos;
			assert.ok(position, `${file} ${panel.title} has a gridPos`);
			assert.ok(
				position.x >= 0 && position.y >= 0 && position.w > 0 && position.h > 0,
				`${file} ${panel.title} has a positive gridPos`,
			);
			assert.ok(
				position.x + position.w <= 24,
				`${file} ${panel.title} fits the 24-column grid`,
			);
			for (const target of panel.targets ?? []) {
				assert.ok(
					target.expr,
					`${file} ${panel.title} target has an expression`,
				);
				assert.equal(
					target.datasource?.uid,
					"prometheus",
					`${file} ${panel.title} uses the fixed prometheus datasource`,
				);
			}
		}

		const placed = panels.filter(
			(panel): panel is Panel & { gridPos: NonNullable<Panel["gridPos"]> } =>
				Boolean(panel.gridPos),
		);
		for (let i = 0; i < placed.length; i += 1)
			for (let k = i + 1; k < placed.length; k += 1) {
				const a = placed[i].gridPos;
				const b = placed[k].gridPos;
				assert.ok(
					!(
						a.x < b.x + b.w &&
						b.x < a.x + a.w &&
						a.y < b.y + b.h &&
						b.y < a.y + a.h
					),
					`${file} ${placed[i].title} overlaps ${placed[k].title}`,
				);
			}
	}
});
