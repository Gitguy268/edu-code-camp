// The frame around every page: top bar with navigation and the camper's stats, and the footer.
import { h } from "./dom.js";
import { icon } from "./icons.js";
import { logo } from "./mascot.js";
import { profile, onChange } from "../state.js";
import { currentStreak, levelInfo } from "../game/game.js";
import { currentPath } from "../router.js";

const NAV = [["/", "Learn"], ["/badges", "Badges"], ["/board", "Leaderboard"], ["/settings", "Settings"]];

export function buildShell(app) {
  const stats = h("div.stats");
  const nav = h("nav.nav", { "aria-label": "Main" }, NAV.map(([href, text]) => h("a", { href: "#" + href }, text)));
  const main = h("main#view", { tabindex: "-1" });
  app.replaceChildren(
    h("header.topbar", h("a.brand", { href: "#/" }, logo(), "edu-code-camp"), nav, stats),
    main,
    h("footer.footer", "Lessons and code © Lucas Van De Weerd, MIT licence · runs offline, your progress stays on this device · ",
      h("a", { href: "https://github.com/Gitguy268/edu-code-camp" }, "source")),
  );
  const paint = () => {
    const p = profile();
    if (!p) return;
    const lvl = levelInfo(p.xp);
    stats.replaceChildren(
      h("span.stat", { title: "Day streak" }, icon("flame"), h("span", String(currentStreak(p))), h("span.sr-only", " day streak")),
      h("span.stat", { title: "Gems" }, icon("gem"), h("span", String(p.gems)), h("span.sr-only", " gems")),
      h("span.stat", { title: `${p.xp} XP` }, icon("star"), h("span", `Lv ${lvl.level}`)),
    );
  };
  const markNav = () => {
    const path = currentPath();
    for (const a of nav.querySelectorAll("a")) {
      const href = a.getAttribute("href").slice(1);
      const on = href === "/" ? path === "/" || path.startsWith("/track") || path.startsWith("/lesson") : path.startsWith(href);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  };
  onChange(paint);
  addEventListener("hashchange", markNav);
  paint();
  markNav();
  return main;
}
