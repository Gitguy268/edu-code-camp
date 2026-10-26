import { h } from "../ui/dom.js";
import { profile, allProfiles } from "../state.js";
import { levelInfo, currentStreak, weekKey } from "../game/game.js";
import { win } from "./home.js";

export default function board(main) {
  const me = profile();
  const wk = weekKey();
  const rows = [...allProfiles()].sort((a, b) => (b.weekly[wk] ?? 0) - (a.weekly[wk] ?? 0) || b.xp - a.xp);
  main.replaceChildren(win("Leaderboard",
    h("p.muted", "Campers on this device, ranked by XP earned this week. Add more campers in Settings."),
    h("table.board",
      h("thead", h("tr", ["#", "Camper", "This week", "Total XP", "Level", "Streak"].map(t => h("th", { scope: "col" }, t)))),
      h("tbody", rows.map((p, i) => h(`tr${p.id === me.id ? ".me" : ""}`,
        h("td", String(i + 1)),
        h("td", h("span.avatar", { style: { background: p.color } }, p.name[0].toUpperCase()), p.name),
        h("td", `${p.weekly[wk] ?? 0} XP`),
        h("td", String(p.xp)),
        h("td", String(levelInfo(p.xp).level)),
        h("td", `${currentStreak(p)} days`)))))));
}
