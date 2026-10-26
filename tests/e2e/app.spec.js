import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { typeCode, submit } from "./helpers.js";

const LOOKS = ["win98", "glass", "terminal", "arcade", "yard", "hose", "hifi", "paper"];

for (const look of LOOKS) {
  test(`the ${look} look renders with readable contrast`, async ({ page }) => {
    await page.addInitScript(l => localStorage.setItem("ecc-look", l), look);
    await page.goto("#/");
    await expect(page.locator(".hero h1")).toContainText("Welcome back");
    await expect(page.locator("html")).toHaveAttribute("data-look", look);
    for (const path of ["#/", "#/lesson/js/hello", "#/badges", "#/settings"]) {
      await page.goto(path);
      await page.waitForTimeout(200);
      const { violations } = await new AxeBuilder({ page }).withRules(["color-contrast"]).disableRules([]).analyze();
      const summary = violations.flatMap(v => v.nodes.map(n => `${path} ${n.target.join(" ")}: ${n.any[0]?.message ?? ""}`));
      expect(summary, summary.join("\n")).toEqual([]);
    }
  });
}

test("switching looks in settings counts towards a badge", async ({ page }) => {
  await page.goto("#/settings");
  for (const name of ["Liquid glass", "Terminal", "8-bit arcade", "Editorial paper"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("data-look", "paper");
  await expect(page.locator(".toast", { hasText: "Interior Decorator" })).toBeVisible();
});

test("export and import progress", async ({ page }, info) => {
  await page.goto("#/lesson/js/hello");
  await typeCode(page, 'console.log("Hello, edu-code-camp!");');
  await submit(page);
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.goto("#/settings");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const file = info.outputPath("backup.json");
  await (await download).saveAs(file);
  const backup = JSON.parse(readFileSync(file, "utf8"));
  expect(backup.app).toBe("edu-code-camp");
  expect(Object.keys(backup.profiles[0].completed)).toContain("js/hello");

  // A fresh browser gets the progress back.
  const fresh = await page.context().browser().newContext();
  const p2 = await fresh.newPage();
  await p2.goto(info.project.use.baseURL + "#/settings");
  await p2.locator('input[type="file"]').setInputFiles(file);
  await expect(p2.locator(".toast")).toContainText("Imported 1 camper");
  await p2.goto(info.project.use.baseURL + "#/track/js");
  await expect(p2.locator(".path li.done")).toHaveCount(1);
  await fresh.close();
});

test("campers on one device share a leaderboard", async ({ page }) => {
  await page.goto("#/settings");
  await page.getByLabel("New camper's name").fill("Grace");
  await page.getByRole("button", { name: "Add camper" }).click();
  await page.goto("#/board");
  await expect(page.locator(".board tbody tr")).toHaveCount(2);
  await expect(page.locator(".board .me")).toContainText("Grace");
});

test("Spot gives a hint without handing over code", async ({ page }) => {
  // A scripted engine stands in for the 672 MB model.
  await page.addInitScript(() => {
    globalThis.__eccEngineFactory = async () => ({
      async chat(messages, onDelta) {
        const ask = messages.at(-1).content;
        if (!ask.includes("Lesson: Hello, console")) throw new Error("no lesson context");
        for (const piece of ["Look at the exact text the task asks for. ", "Here:\n```js\nconsole.log('x');\nconsole.log('y');\n```"]) onDelta(piece);
      },
    });
  });
  await page.goto("#/lesson/js/hello");
  await page.getByRole("button", { name: "Wake Spot" }).click();
  await page.getByRole("button", { name: "Give me a hint" }).click();
  const reply = page.locator(".bubble.spot").last();
  await expect(reply).toContainText("Look at the exact text");
  await expect(reply).toContainText("stopped");
  await expect(reply).not.toContainText("console.log('y')");
  await expect(page.locator(".toast", { hasText: "Good Question" })).toBeVisible();
});

test("works offline after the first visit", async ({ page, context }) => {
  await page.goto("#/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.goto("#/lesson/js/hello");
  await expect(page.locator(".cm-content")).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".hero, .cm-content").first()).toBeVisible();
  await typeCode(page, 'console.log("offline!")');
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator(".console")).toContainText("offline!");
});

test("opening index.html from a file shows how to start the app", async ({ page }) => {
  await page.goto("file://" + process.cwd() + "/dist/index.html");
  await expect(page.getByRole("heading", { name: "Open edu-code-camp with start.command" })).toBeVisible();
});
