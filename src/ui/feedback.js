// Toasts for small news, dialogs for big news. No browser alert/confirm.
import { h } from "./dom.js";
import { icon } from "./icons.js";

let box;
export function toast(text, iconName = "star") {
  box ??= document.body.appendChild(h("div.toasts", { role: "status", "aria-live": "polite" }));
  const el = h("div.toast", icon(iconName), h("span", text));
  box.append(el);
  setTimeout(() => el.remove(), 4200);
}

export function eventLine(e) {
  switch (e.type) {
    case "xp": return [`+${e.xp} XP${e.firstTry ? " (first try bonus)" : ""}`, "bolt"];
    case "level": return [`Level ${e.level}! You're a ${e.rank} now`, "star"];
    case "streak": return [`${e.count}-day streak`, "flame"];
    case "freeze": return [`A streak freeze saved your streak`, "snow"];
    case "chest": return ["You earned a chest! Open it on the home page", "chest"];
    case "achievement": return [`Badge: ${e.name}`, "trophy"];
    case "quest": return [`Quest done: ${e.text} (+${e.gems} gems)`, "gem"];
    case "reward": return [`Chest: ${e.text}`, "chest"];
    default: return [null];
  }
}

export function toastEvents(events) {
  for (const e of events) {
    const [text, ic] = eventLine(e);
    if (text) toast(text, ic);
  }
}

/** A modal window. buttons: [{ label, value, primary }]. Resolves with the chosen value (null on Esc). */
export function dialog({ title, body, buttons = [{ label: "OK", value: true, primary: true }], className = "" }) {
  return new Promise(resolve => {
    const d = h("dialog", { "aria-label": title });
    let value = null;
    const done = v => { value = v; d.close(); };
    // Also closed by the router when the page changes underneath it.
    d.addEventListener("close", () => { d.remove(); resolve(value); });
    d.append(h(`div.window${className ? "." + className : ""}`,
      h("div.titlebar", h("span.title-text", title), h("span.controls", h("span", { "aria-hidden": "true" }, "×"))),
      h("div.window-body", body, h("div.row", { style: { justifyContent: "flex-end", marginTop: "14px" } },
        buttons.map(b => h(`button.btn${b.primary ? ".primary" : ""}`, { type: "button", onclick: () => done(b.value) }, b.label))))));
    d.addEventListener("cancel", e => { e.preventDefault(); done(null); });
    document.body.append(d);
    d.showModal();
    d.querySelector(".btn.primary")?.focus();
  });
}

export const confirmDialog = (title, text, yes = "Yes") =>
  dialog({ title, body: h("p", text), buttons: [{ label: "Cancel", value: false }, { label: yes, value: true, primary: true }] });
