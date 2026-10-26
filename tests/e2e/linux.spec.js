import { test, expect } from "@playwright/test";

// Boots the real Alpine VM in v86, which takes 30 to 60 seconds the first time.
test("a Linux lesson: work in the shell, then pass the hidden checks", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("#/lesson/linux/pwd-ls");
  await expect(page.locator(".toolbar [role=status]")).toContainText("ready", { timeout: 180_000 });
  await page.locator(".term-host").click();
  await page.getByRole("button", { name: "Check my work" }).click();
  await expect(page.locator(".results .fail").first()).toBeVisible();
  await page.locator(".term-host").click();
  await page.keyboard.type("ls -a trail/forest/summit\n");
  await expect(page.locator(".xterm-rows")).toContainText(".flag-on-the-peak", { timeout: 15_000 });
  await page.keyboard.type("echo .flag-on-the-peak > answer.txt\n");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Check my work" }).click();
  await expect(page.locator("dialog[open]")).toContainText("XP", { timeout: 30_000 });
});
