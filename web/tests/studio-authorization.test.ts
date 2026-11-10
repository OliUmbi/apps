import assert from "node:assert/strict";
import test from "node:test";
import { mayManage } from "../sites/studio/src/server/roles";

/*
 * The Studio authorization rule is the gate every server function relies on:
 * a site role may manage only its own site, and cross-site access needs the
 * admin role. These cases pin the decision, not the HTTP plumbing around it.
 */

test("studio.admin manages every site and the cross-site overview", () => {
	assert.equal(mayManage(["studio.admin"], "zelglihof"), true);
	assert.equal(mayManage(["studio.admin"], "jublawoma"), true);
	assert.equal(mayManage(["studio.admin"]), true);
	assert.equal(mayManage(["studio.admin", "zelglihof.manage"], "unclet"), true);
});

test("a site role manages only its own site", () => {
	assert.equal(mayManage(["zelglihof.manage"], "zelglihof"), true);
	assert.equal(mayManage(["zelglihof.manage"], "unclet"), false);
	assert.equal(mayManage(["zelglihof.manage"], undefined), false);
});

test("a site role never reaches the cross-site overview", () => {
	assert.equal(mayManage(["zelglihof.manage", "unclet.manage"]), false);
});

test("unrelated or empty permissions are denied", () => {
	assert.equal(mayManage([], "zelglihof"), false);
	assert.equal(mayManage(["identity.read"], "zelglihof"), false);
	assert.equal(mayManage(["zelglihof"], "zelglihof"), false);
});
