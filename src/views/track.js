import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { profile } from "../state.js";
import { trackById } from "../content.js";
import { isUnlocked } from "../game/game.js";
import { win, progressBar, LANG_LABEL } from "./home.js";

export default function track(main, { id }) {
  const t = trackById(id);
  if (!t) return main.replaceChildren(h("p.empty", "That track doesn't exist."));
  const p = profile();
  const done = t.lessons.filter(l => p.completed[l.id]).length;
  let nextMarked = false;
  main.replaceChildren(h("div.stack",
    win(t.kind === "project" ? "Guided project" : "Course",
      h("h1", h("span.track-icon", { style: { display: "inline-grid", marginRight: "10px", verticalAlign: "middle" } }, LANG_LABEL[t.lang]), t.title),
      h("p", t.description),
      progressBar(done / t.lessons.length, "Track progress"),
      h("p.muted", { style: { marginTop: "6px" } }, `${done} of ${t.lessons.length} lessons done`)),
    win("Lessons", h("ol.path", t.lessons.map(l => {
      const isDone = Boolean(p.completed[l.id]);
      const open = isUnlocked(p, t, l.index);
      const isNext = !isDone && open && !nextMarked;
      if (isNext) nextMarked = true;
      const cls = isDone ? "done" : isNext ? "next" : "";
      const inner = [
        h("span.node", isDone ? icon("check") : open ? String(l.index + 1) : icon("lock")),
        h("span", h("strong", l.title), h("br"), h("span.muted", l.summary ?? "")),
        h("span.pill", `${l.xp} XP`),
      ];
      return h(`li.${cls || "plain"}`, open ? h("a", { href: `#/lesson/${l.id}` }, inner) : h("span.locked", { "aria-disabled": "true", title: "Finish the lesson before this one first" }, inner));
    }))),
  ));
}
