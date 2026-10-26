import { h } from "../ui/dom.js";
import { toast, toastEvents, confirmDialog } from "../ui/feedback.js";
import { LOOKS, setLook, currentLook, currentTint } from "../looks/looks.js";
import { profile, allProfiles, addProfile, switchProfile, removeProfile, changed, ctx, reloadProfiles, flushSave } from "../state.js";
import { exportAll, importAll } from "../store/db.js";
import { COLORS, recordStat } from "../game/game.js";
import { win } from "./home.js";
import { currentPath } from "../router.js";

export default function settings(main) {
  const p = profile();
  // Async actions finish later; only redraw if the camper is still on this page.
  const redraw = () => currentPath() === "/settings" && settings(document.getElementById("view"));

  const looks = h("div.looks");
  const paintLooks = () => looks.replaceChildren(...LOOKS.map(l => h("button.look-card", {
    type: "button",
    "aria-pressed": String(currentLook() === l.id),
    onclick: () => {
      setLook(l.id);
      toastEvents(recordStat(p, "looks", ctx, l.id));
      changed();
      paintLooks();
    },
  }, h("span.swatch", l.swatch.map(c => h("span", { style: { background: c } }))), h("strong", l.name), h("small", `Inspired by ${l.from}`))));
  paintLooks();
  const tints = h("div.row", h("span", "Terminal tint:"), ...LOOKS.find(l => l.id === "terminal").tints.map(t =>
    h("button.btn.small", { type: "button", "aria-pressed": String(currentTint() === t), onclick: () => { setLook("terminal", t); paintLooks(); redraw(); } }, t)));

  const name = h("input", { type: "text", value: p.name, maxlength: "24", "aria-label": "Your name" });
  const people = h("div.stack", { style: { gap: "8px" } }, allProfiles().map(x => h("div.row",
    h("span.avatar", { style: { background: x.color } }, x.name[0].toUpperCase()),
    h("span", x.name, x.id === p.id ? " (you)" : ""), h("span.spacer"),
    x.id !== p.id ? h("button.btn.small", { type: "button", onclick: async () => { await switchProfile(x.id); redraw(); } }, "Switch") : null,
    allProfiles().length > 1 ? h("button.btn.small", { type: "button", onclick: async () => {
      if (await confirmDialog("Delete camper", `Delete ${x.name} and all their progress on this device?`, "Delete")) { await removeProfile(x.id); redraw(); }
    } }, "Delete") : null)));
  const newName = h("input", { type: "text", placeholder: "New camper's name", maxlength: "24", "aria-label": "New camper's name" });

  const file = h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: async () => {
    const f = file.files[0];
    if (!f) return;
    try {
      const ids = await importAll(JSON.parse(await f.text()));
      const n = ids.length;
      await reloadProfiles(ids[0]);
      toast(`Imported ${n} camper${n === 1 ? "" : "s"}`, "check");
      redraw();
    } catch (err) {
      toast(`Couldn't import: ${err.message}`, "lock");
    }
  } });

  main.replaceChildren(h("div.stack",
    win("Look", h("p.muted", "Every look is inspired by one of the author's own projects."), looks, currentLook() === "terminal" ? h("div", { style: { marginTop: "12px" } }, tints) : null),
    h("div.grid.cols-2",
      win("You",
        h("label.row", h("span", "Name"), name,
          h("button.btn", { type: "button", onclick: () => { p.name = name.value.trim().slice(0, 24) || p.name; changed(); toast("Saved", "check"); redraw(); } }, "Save")),
        h("div.row", { style: { marginTop: "10px" } }, h("span", "Colour"), COLORS.map(c => h("button.avatar", {
          type: "button", "aria-label": `Colour ${c}`, "aria-pressed": String(p.color === c),
          style: { background: c, border: p.color === c ? "3px solid var(--text)" : "0", cursor: "pointer" },
          onclick: () => { p.color = c; changed(); redraw(); },
        }, ""))),
      ),
      win("Campers on this device", people,
        h("div.row", { style: { marginTop: "12px" } }, newName,
          h("button.btn.primary", { type: "button", onclick: async () => { if (!newName.value.trim()) return newName.focus(); await addProfile(newName.value, COLORS[allProfiles().length % COLORS.length]); redraw(); } }, "Add camper"))),
      win("Backup",
        h("p", "Your progress lives in this browser only. Export it to keep a copy or move it to another browser."),
        h("div.row",
          h("button.btn.primary", { type: "button", onclick: async () => {
            await flushSave();
            const data = await exportAll();
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
            h("a", { href: url, download: `edu-code-camp-backup-${new Date().toISOString().slice(0, 10)}.json` }).click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toastEvents(recordStat(p, "exports", ctx));
            changed();
          } }, "Export progress"),
          h("button.btn", { type: "button", onclick: () => file.click() }, "Import a backup"), file)),
      win("About",
        h("p", "edu-code-camp is free and open source under the MIT licence. Lessons are original. The idea of learning by passing tests with XP and a tutor comes from boot.dev and freeCodeCamp; no lessons or code were copied from either."),
        h("p", h("a", { href: "./NOTICE.txt" }, "Third-party notices"), " · ", h("a", { href: "https://github.com/Gitguy268/edu-code-camp" }, "Source code"))),
    ),
  ));
}
