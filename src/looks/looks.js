// The looks, each inspired by one of the author's own projects. One stylesheet holds them all,
// scoped by data-look on <html>; switching only changes that attribute.
import "../styles/fonts.css";
import "../styles/base.css";
import "../styles/looks/win98.css";
import "../styles/looks/glass.css";
import "../styles/looks/terminal.css";
import "../styles/looks/arcade.css";
import "../styles/looks/yard.css";
import "../styles/looks/hose.css";
import "../styles/looks/hifi.css";
import "../styles/looks/paper.css";

export const LOOKS = [
  { id: "win98", name: "Win98 + glass", from: "qrer, Retrofind, Paint97", swatch: ["#008080", "#c0c0c0", "#000080"] },
  { id: "glass", name: "Liquid glass", from: "GlassPaint, pikado, liquidframe", swatch: ["#0f0f13", "#0a84ff", "#bf5af2"] },
  { id: "terminal", name: "Terminal", from: "Gitguy268 shell, TabShell", swatch: ["#101614", "#a8dfb9", "#5fd68a"], tints: ["mint", "amber", "crt"] },
  { id: "arcade", name: "8-bit arcade", from: "8bit-player, cozy-christmas-lab", swatch: ["#0f0f1b", "#ff0044", "#00e5ff"] },
  { id: "yard", name: "Spot's yard", from: "spot-snake, spot-light", swatch: ["#6dbb4f", "#d8342f", "#17131f"] },
  { id: "hose", name: "Rubber hose", from: "rubber-hose-revue", swatch: ["#111111", "#d9d6cf", "#7a7a7a"] },
  { id: "hifi", name: "Hi-fi deck", from: "Vinyl-Player, iPod classic", swatch: ["#1a1a1e", "#d8d6d2", "#e8562a"] },
  { id: "paper", name: "Editorial paper", from: "editorial print", swatch: ["#f3f1ea", "#1c1b19", "#c4122f"] },
];

const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

export const currentLook = () => document.documentElement.dataset.look;
export const currentTint = () => document.documentElement.dataset.tint || "mint";

export function setLook(id, tint) {
  if (!LOOKS.some(l => l.id === id)) id = "win98";
  const root = document.documentElement;
  root.dataset.look = id;
  store.set("ecc-look", id);
  if (tint) {
    root.dataset.tint = tint;
    store.set("ecc-tint", tint);
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
}

export function initLook() {
  setLook(store.get("ecc-look") || "win98", store.get("ecc-tint") || "mint");
}
