export async function typeCode(page, code) {
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  // insertText skips CodeMirror's auto-closing brackets, so the code arrives exactly as written.
  await page.keyboard.insertText(code);
}

export const submit = page => page.getByRole("button", { name: "Submit", exact: true }).click();
export const run = page => page.getByRole("button", { name: "Run", exact: true }).click();
