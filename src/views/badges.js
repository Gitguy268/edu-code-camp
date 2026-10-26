import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { profile } from "../state.js";
import { ACHIEVEMENTS } from "../game/game.js";
import { win } from "./home.js";

export default function badges(main) {
  const p = profile();
  const got = ACHIEVEMENTS.filter(a => p.achievements[a.id]).length;
  main.replaceChildren(win(`Badges · ${got} of ${ACHIEVEMENTS.length}`,
    h("div.grid.cols-3", ACHIEVEMENTS.map(a => {
      const at = p.achievements[a.id];
      return h(`div.badge${at ? ".got" : ""}`,
        h("span.medal", at ? icon("trophy") : icon("lock")),
        h("div", h("strong", a.name), h("br"), h("span.muted", a.text), at ? h("br") : null, at ? h("small.muted", `Earned ${new Date(at).toLocaleDateString()}`) : null));
    }))));
}
