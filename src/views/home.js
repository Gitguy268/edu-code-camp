import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { spot } from "../ui/mascot.js";
import { toastEvents, dialog, eventLine } from "../ui/feedback.js";
import { profile, changed, ctx } from "../state.js";
import { tracks } from "../content.js";
import { levelInfo, rankFor, questsFor, currentStreak, openChest, buyFreeze, FREEZE_COST, MAX_FREEZES, isUnlocked } from "../game/game.js";

export const LANG_LABEL = { js: "JS", py: "PY", sql: "SQL", sh: "$_" };

export function nextLesson(p, track) {
  const i = track.lessons.findIndex(l => !p.completed[l.id]);
  return i === -1 ? null : track.lessons[i];
}

export function progressBar(pct, label) {
  return h("div.bar", { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(pct * 100)), "aria-label": label },
    h("span", { style: { width: `${Math.round(pct * 100)}%` } }));
}

export function win(title, ...body) {
  return h("section.window", { "aria-label": title },
    h("div.titlebar", h("span.title-text", title), h("span.controls", { "aria-hidden": "true" }, h("span", "_"), h("span", "□"), h("span", "×"))),
    h("div.window-body", ...body));
}

export default function home(main) {
  const p = profile();
  const lvl = levelInfo(p.xp);
  const resume = tracks.map(t => nextLesson(p, t)).find(Boolean);
  const quests = questsFor(p);
  const streak = currentStreak(p);

  const chestBox = h("div");
  const paintChest = () => {
    chestBox.replaceChildren(
      h("p", p.chests.ready ? `You have ${p.chests.ready} chest${p.chests.ready > 1 ? "s" : ""} to open.` : `Finish ${5 - (Object.keys(p.completed).length % 5)} more lesson(s) for your next chest.`),
      h("div.row",
        h("button.btn.primary", { type: "button", disabled: !p.chests.ready, onclick: async () => {
          const events = openChest(p, ctx);
          changed();
          const [text] = eventLine(events[0]);
          await dialog({ title: "Chest opened", body: h("div.celebrate", icon("chest"), h("p.big", text.replace("Chest: ", ""))), className: "celebrate" });
          toastEvents(events.slice(1));
          paintChest();
        } }, icon("chest"), "Open chest"),
        h("button.btn", { type: "button", disabled: p.gems < FREEZE_COST || p.streak.freezes >= MAX_FREEZES, onclick: () => {
          if (buyFreeze(p)) { changed(); paintChest(); }
        } }, icon("snow"), `Streak freeze (${FREEZE_COST} gems)`)),
      h("p.muted", { style: { marginTop: "8px" } }, `Freezes: ${p.streak.freezes} of ${MAX_FREEZES}. A freeze covers a day you miss.`),
    );
  };
  paintChest();

  main.replaceChildren(h("div.stack",
    win("Welcome", h("div.hero", spot(),
      h("div",
        h("h1", `Welcome back, ${p.name}`),
        h("p.muted", `Level ${lvl.level} · ${rankFor(lvl.level)} · ${p.xp} XP · best streak ${p.streak.best} days`),
        progressBar(lvl.pct, "Progress to next level"),
        h("div.level-line", h("span", `${lvl.into} / ${lvl.need} XP to level ${lvl.level + 1}`), h("span", p.boost ? `Double XP: ${p.boost} lessons left` : "")),
        h("div.row", { style: { marginTop: "12px" } },
          resume ? h("a.btn.primary", { href: `#/lesson/${resume.id}` }, icon("play"), `Continue: ${resume.title}`) : h("span.pill", "You've finished every lesson. Amazing."),
        )))),
    h("div.grid.cols-3",
      win("Daily quests", quests.map(q => h(`div.quest${q.done ? ".done" : ""}`,
        h("span.quest-text", q.text), h("span.pill", icon("gem"), `+${q.gems}`),
        progressBar(q.progress / q.goal, q.text)))),
      win("Streak", h("div.row", icon("flame"), h("strong", { style: { fontSize: "1.6rem" } }, String(streak)), h("span", "day streak")),
        h("p.muted", streak ? "Finish a lesson today to keep it going." : "Finish a lesson to start a streak.")),
      win("Chests and freezes", chestBox)),
    h("h2.section-title", "Tracks"),
    h("div.grid.cols-3", tracks.map(t => {
      const done = t.lessons.filter(l => p.completed[l.id]).length;
      const next = nextLesson(p, t);
      return h("div.track-card.window",
        h("div.titlebar", h("span.title-text", t.kind === "project" ? "Guided project" : "Course"), h("span.controls", { "aria-hidden": "true" }, h("span", "×"))),
        h("div.window-body",
          h("h3", h("span.track-icon", LANG_LABEL[t.lang]), t.title),
          h("p.desc", t.description),
          progressBar(done / t.lessons.length, `${t.title} progress`),
          h("div.row", h("span.muted", `${done} of ${t.lessons.length} done`), h("span.spacer"),
            h("a.btn.small", { href: `#/track/${t.id}` }, "Open"),
            next && isUnlocked(p, t, next.index) ? h("a.btn.small.primary", { href: `#/lesson/${next.id}` }, done ? "Continue" : "Start") : null)));
    })),
  ));
}
