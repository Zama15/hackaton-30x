import { test } from "node:test";
import assert from "node:assert/strict";
import { echo } from "../src/tools/echo.js";

test("echo tool returns its input", async () => {
  assert.equal(await echo.run({ text: "hi" }), "hi");
});
