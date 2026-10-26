import { initLook } from "./looks/looks.js";
import { loadState } from "./state.js";
import { route, startRouter } from "./router.js";
import { buildShell } from "./ui/shell.js";
import { svg } from "./ui/dom.js";
import home from "./views/home.js";
import track from "./views/track.js";
import lesson from "./views/lesson.js";
import badges from "./views/badges.js";
import board from "./views/board.js";
import settings from "./views/settings.js";

// The displacement map behind the Win98 look's liquid glass (used by backdrop-filter in Chromium).
const GLASS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="ecc-glass" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;

async function boot() {
  if (location.protocol === "file:") return;
  initLook();
  document.body.prepend(svg(GLASS));
  await loadState();
  const main = buildShell(document.getElementById("app"));
  route("/", home);
  route("/track/:id", track);
  route("/lesson/:track/:slug", lesson);
  route("/badges", badges);
  route("/board", board);
  route("/settings", settings);
  // Each page renders into its own box and only replaces the current page if the camper is still on
  // its route when it's ready (lessons load the editor or the VM first).
  let current = 0;
  startRouter(async (view, params) => {
    const ticket = ++current;
    const box = document.createElement("div");
    const out = await view(box, params);
    if (ticket !== current) { out?.(); return null; }
    main.replaceChildren(...box.childNodes);
    main.classList.toggle("wide", box.classList.contains("wide"));
    window.scrollTo(0, 0);
    return out;
  });
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(err => console.warn("edu-code-camp: offline mode unavailable", err));
  }
}

boot().catch(err => {
  document.getElementById("app").textContent = `edu-code-camp couldn't start: ${err.message}`;
  console.error(err);
});
