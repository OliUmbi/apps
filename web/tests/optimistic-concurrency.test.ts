import assert from "node:assert/strict";
import test from "node:test";
import {
	isConcurrentUpdateError as isJublawomaConflict,
	ConcurrentUpdateError as JublawomaConcurrentUpdateError,
	RecordKeyMismatchError as JublawomaRecordKeyMismatchError,
	concurrentUpdateMessage as jublawomaConflictMessage,
	updateMissError as jublawomaUpdateMiss,
} from "../packages/jublawoma-data/src/content/errors";
import {
	isConcurrentUpdateError as isUncletConflict,
	ConcurrentUpdateError as UncletConcurrentUpdateError,
	RecordKeyMismatchError as UncletRecordKeyMismatchError,
	concurrentUpdateMessage as uncletConflictMessage,
	updateMissError as uncletUpdateMiss,
} from "../packages/unclet-data/src/content/errors";
import {
	isConcurrentUpdateError as isZelglihofConflict,
	ConcurrentUpdateError as ZelglihofConcurrentUpdateError,
	RecordKeyMismatchError as ZelglihofRecordKeyMismatchError,
	concurrentUpdateMessage as zelglihofConflictMessage,
	updateMissError as zelglihofUpdateMiss,
} from "../packages/zelglihof-data/src/content/errors";

const stale = "2026-01-01T00:00:00.000Z";
const current = "2026-01-02T00:00:00.000Z";

const packages = [
	{
		name: "jublawoma",
		updateMissError: jublawomaUpdateMiss,
		isConcurrentUpdateError: isJublawomaConflict,
		ConcurrentUpdateError: JublawomaConcurrentUpdateError,
		RecordKeyMismatchError: JublawomaRecordKeyMismatchError,
	},
	{
		name: "unclet",
		updateMissError: uncletUpdateMiss,
		isConcurrentUpdateError: isUncletConflict,
		ConcurrentUpdateError: UncletConcurrentUpdateError,
		RecordKeyMismatchError: UncletRecordKeyMismatchError,
	},
	{
		name: "zelglihof",
		updateMissError: zelglihofUpdateMiss,
		isConcurrentUpdateError: isZelglihofConflict,
		ConcurrentUpdateError: ZelglihofConcurrentUpdateError,
		RecordKeyMismatchError: ZelglihofRecordKeyMismatchError,
	},
];

test("a missed update is classified by identity, then token, then editability", () => {
	for (const {
		name,
		updateMissError,
		ConcurrentUpdateError,
		RecordKeyMismatchError,
	} of packages) {
		const missing = updateMissError(`${name}.table`, null, stale);
		assert.equal(missing.name, "Error");
		assert.match(missing.message, /no longer editable/);

		const staleWrite = updateMissError(
			`${name}.table`,
			{ updatedAt: current },
			stale,
		);
		assert.ok(staleWrite instanceof ConcurrentUpdateError, name);
		assert.equal(staleWrite.table, `${name}.table`);

		const wrongIdentity = updateMissError(
			`${name}.table`,
			{ updatedAt: stale },
			stale,
			false,
		);
		assert.ok(wrongIdentity instanceof RecordKeyMismatchError, name);

		// Identity outranks a stale token, so key guards keep their verdict.
		const wrongIdentityStale = updateMissError(
			`${name}.table`,
			{ updatedAt: current },
			stale,
			false,
		);
		assert.ok(wrongIdentityStale instanceof RecordKeyMismatchError, name);

		// Token and identity both match, but the statement was allowed to skip
		// the row (e.g. a status guard): that is not a concurrency conflict.
		const skippedByGuard = updateMissError(
			`${name}.table`,
			{ updatedAt: stale },
			stale,
		);
		assert.equal(skippedByGuard.name, "Error");
		assert.match(skippedByGuard.message, /no longer editable/);
	}
});

test("the conflict message is one stable contract across the data packages", () => {
	assert.equal(jublawomaConflictMessage, uncletConflictMessage);
	assert.equal(jublawomaConflictMessage, zelglihofConflictMessage);
});

test("the conflict survives the server-function boundary in message form", () => {
	for (const {
		name,
		isConcurrentUpdateError,
		ConcurrentUpdateError,
	} of packages) {
		const typed = new ConcurrentUpdateError(`${name}.table`);
		assert.ok(isConcurrentUpdateError(typed), name);
		// The boundary keeps only Error.message and rebuilds a plain Error.
		assert.ok(isConcurrentUpdateError(new Error(typed.message)), name);
		assert.equal(isConcurrentUpdateError(new Error("Something else")), false);
		assert.equal(isConcurrentUpdateError(`${name}.table`), false);
		assert.equal(isConcurrentUpdateError(null), false);
	}
});
