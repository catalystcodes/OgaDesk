import assert from "node:assert/strict";
import test from "node:test";

import { completeSSOFlow } from "../src/lib/complete-sso.ts";
import { getAuthErrorMessage } from "../src/lib/auth-errors.ts";
import { sessionAccess } from "../src/lib/session-routing.ts";

test("cancelling or dismissing the browser never activates a session", async () => {
  for (const type of ["cancel", "dismiss"]) {
    const result = await completeSSOFlow(
      {
        authSessionResult: { type },
        createdSessionId: null,
        setActive: () => assert.fail("Cancelled flow activated a session"),
      },
      () => assert.fail("Cancelled flow navigated"),
    );
    assert.equal(result, "cancelled");
  }
});

test("successful OAuth awaits session activation before completing", async () => {
  let activated = false;
  const result = await completeSSOFlow(
    {
      authSessionResult: { type: "success" },
      createdSessionId: "sess_example",
      setActive: async ({ session }) => {
        assert.equal(session, "sess_example");
        await Promise.resolve();
        activated = true;
      },
    },
    () => assert.fail("Unexpected session task"),
  );
  assert.equal(activated, true);
  assert.equal(result, "signed-in");
});

test("pending session tasks remain in authentication", async () => {
  let continued = false;
  const outcome = await completeSSOFlow(
    {
      authSessionResult: { type: "success" },
      createdSessionId: "sess_pending",
      setActive: async ({ navigate }) => {
        await navigate({
          session: { currentTask: { key: "choose-organization" } },
        });
      },
    },
    () => {
      continued = true;
    },
  );
  assert.equal(continued, true);
  assert.equal(outcome, "pending", "Pending tasks must not trigger account navigation");
});

test("missing signup requirements and MFA continue without granting access", async () => {
  for (const [signUp, expected] of [
    [{ status: "missing_requirements" }, "sign-up"],
    [undefined, "sign-in"],
  ]) {
    assert.equal(
      await completeSSOFlow(
        {
          authSessionResult: { type: "success" },
          createdSessionId: null,
          signUp,
          setActive: () => assert.fail("Incomplete flow activated a session"),
        },
        () => assert.fail("Unexpected navigation"),
      ),
      expected,
    );
  }
});

test("an unstarted or invalid browser flow does not count as success", async () => {
  for (const authSessionResult of [null, { type: "locked" }]) {
    assert.equal(
      await completeSSOFlow(
        { authSessionResult, createdSessionId: null },
        () => {},
      ),
      "failed",
    );
  }
  assert.equal(
    await completeSSOFlow(
      {
        authSessionResult: { type: "success" },
        createdSessionId: "sess_example",
      },
      () => {},
    ),
    "failed",
  );
});

test("session activation failures propagate for retry", async () => {
  const failure = new Error("offline");
  await assert.rejects(
    completeSSOFlow(
      {
        authSessionResult: { type: "success" },
        createdSessionId: "sess_example",
        setActive: async () => {
          throw failure;
        },
      },
      () => {},
    ),
    failure,
  );
});

test("errors display user-facing Clerk messages and hide unexpected data", () => {
  assert.equal(
    getAuthErrorMessage({
      errors: [{ longMessage: "Please try another account." }],
    }),
    "Please try another account.",
  );
  assert.equal(
    getAuthErrorMessage({ errors: [{ code: "network_error" }] }),
    "Check your internet connection and try again.",
  );
  for (const error of [
    null,
    "secret-data",
    new Error("secret-data"),
    { request: "secret-data" },
  ]) {
    assert.equal(
      getAuthErrorMessage(error),
      "We couldn’t sign you in. Please try again.",
    );
  }
});

test("organisation selection tasks enter app setup but cannot open the workspace", () => {
  const access = sessionAccess(true, "choose-organization");
  assert.equal(access.canSetUp, true);
  assert.equal(access.canOpenWorkspace, false);
  assert.equal(access.needsVerification, false);
});

test("MFA and password tasks cannot bypass verification through setup routes", () => {
  for (const task of ["setup-mfa", "reset-password", "future-verification-task"]) {
    const access = sessionAccess(true, task);
    assert.equal(access.canSetUp, false);
    assert.equal(access.canOpenWorkspace, false);
    assert.equal(access.needsVerification, true);
  }
});

test("only active sessions without tasks can open a workspace", () => {
  assert.equal(sessionAccess(true).canOpenWorkspace, true);
  for (const signedIn of [false, undefined]) {
    assert.equal(sessionAccess(signedIn).canSetUp, false);
    assert.equal(sessionAccess(signedIn).canOpenWorkspace, false);
  }
});
