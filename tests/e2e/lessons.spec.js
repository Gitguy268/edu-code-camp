import { test, expect } from "@playwright/test";
import { typeCode, submit, run } from "./helpers.js";

test("a JavaScript lesson: fail, then pass, earn XP and a badge", async ({ page }) => {
  await page.goto("#/lesson/js/hello");
  await typeCode(page, 'console.log("hello")');
  await submit(page);
  await expect(page.locator(".result-banner")).toHaveText(/Not yet/);
  await expect(page.locator(".results .fail")).toContainText("should be");
  await typeCode(page, 'console.log("Hello, edu-code-camp!");');
  await submit(page);
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toContainText("+10 XP");
  await expect(dialog).toContainText("First Steps");
  await dialog.getByRole("button", { name: "Next lesson" }).click();
  await expect(page).toHaveURL(/#\/lesson\/js\/variables/);
  await expect(page.locator(".topbar .stat").nth(1)).toContainText(/\d+/);
});

test("code is saved as a draft", async ({ page }) => {
  await page.goto("#/lesson/js/hello");
  await typeCode(page, "// my draft 42");
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.locator(".cm-content")).toContainText("my draft 42");
});

test("an endless loop is stopped", async ({ page }) => {
  await page.goto("#/lesson/js/hello");
  await typeCode(page, "while (true) {}");
  await run(page);
  await expect(page.locator(".console")).toContainText("Stopped after 4 seconds", { timeout: 10_000 });
  await expect(page.locator(".toast", { hasText: "Halting Problem" })).toBeVisible();
  // The runner comes back for the next run.
  await typeCode(page, 'console.log("alive")');
  await run(page);
  await expect(page.locator(".console")).toContainText("alive");
});

test("a Python lesson runs real Python", async ({ page }) => {
  await page.goto("#/lesson/py/print");
  await typeCode(page, 'print("Python is awake")\nprint("2 + 2 =", 2 + 2)\nprint(sum(range(5)))');
  await run(page);
  await expect(page.locator(".console")).toContainText("2 + 2 = 4", { timeout: 45_000 });
  await expect(page.locator(".console")).toContainText("10");
  await typeCode(page, 'print("Python is awake")\nprint("2 + 2 =", 2 + 2)');
  await submit(page);
  await expect(page.locator("dialog[open]")).toContainText("XP");
});

test("Python errors point at the learner's line", async ({ page }) => {
  await page.goto("#/lesson/py/print");
  await typeCode(page, 'x = 1\nprint(y)');
  await run(page);
  await expect(page.locator(".console")).toContainText("NameError", { timeout: 45_000 });
  await expect(page.locator(".console")).toContainText("line 2");
});

test("a SQL lesson shows result tables and checks rows", async ({ page }) => {
  await page.goto("#/lesson/sql/select");
  await typeCode(page, "SELECT * FROM campers LIMIT 2;");
  await run(page);
  await expect(page.locator(".sql-table")).toContainText("Ada");
  await typeCode(page, "SELECT name, cabin FROM campers;");
  await submit(page);
  await expect(page.locator("dialog[open]")).toContainText("XP");
});

test("locked lessons stay locked", async ({ page }) => {
  await page.goto("#/lesson/js/scoreboard");
  await expect(page.getByText("Finish the lesson before this one first.")).toBeVisible();
});
