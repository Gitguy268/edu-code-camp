import { marked } from "marked";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { toastEvents, dialog, eventLine, confirmDialog } from "../ui/feedback.js";
import { profile, changed, ctx } from "../state.js";
import { lessonById, trackById } from "../content.js";
import { getDraft, putDraft, deleteDraft } from "../store/db.js";
import { isUnlocked, recordAttempt, completeLesson, recordStat } from "../game/game.js";
import { runnerFor } from "../runners/runner.js";
import { win } from "./home.js";

marked.setOptions({ gfm: true });

function lessonText(lesson, track) {
  return h("section.window.lesson-text", { "aria-label": "Lesson" },
    h("div.titlebar", h("span.title-text", `${track.title} · ${lesson.index + 1} of ${track.lessons.length}`), h("span.controls", { "aria-hidden": "true" }, h("span", "?"), h("span", "×"))),
    h("div.window-body.prose", { html: marked.parse(`# ${lesson.title}\n\n${lesson.body}`) }));
}

function renderResults(box, result, { tests }) {
  box.replaceChildren();
  if (result.error) box.append(h("div.result-banner.fail", result.error));
  else if (tests) box.append(h(`div.result-banner.${result.pass ? "pass" : "fail"}`, result.pass ? "All checks passed!" : "Not yet. Look at the checks below."));
  if (result.results?.length) {
    box.append(h("ul.results", result.results.map(r => h(`li.${r.pass ? "pass" : "fail"}`,
      h("span.mark", r.pass ? icon("check", "passed") : "✗"), h("span", r.name), r.pass ? null : h("span.msg", r.message)))));
  }
}

function sqlTables(tables) {
  return tables.map(t => h("table.sql-table",
    h("thead", h("tr", t.columns.map(c => h("th", c)))),
    h("tbody", t.values.slice(0, 50).map(row => h("tr", row.map(v => h("td", v === null ? "NULL" : String(v))))))));
}

/** Where the code for a lesson starts: the saved draft, the previous step's code (projects), or the starter. */
async function startingCode(p, lesson, track) {
  const draft = await getDraft(p.id, lesson.id).catch(() => null);
  if (draft != null) return draft;
  if (lesson.carry && lesson.index > 0) {
    const prev = track.lessons[lesson.index - 1];
    const prevCode = await getDraft(p.id, prev.id).catch(() => null);
    if (prevCode != null && lesson.starter) return `${prevCode.trimEnd()}\n\n${lesson.starter}`;
  }
  return lesson.starter ?? "";
}

async function celebrate(events, lesson, track) {
  const next = track.lessons[lesson.index + 1];
  const lines = events.map(eventLine).filter(([t]) => t);
  const xp = events.find(e => e.type === "xp");
  const choice = await dialog({
    title: "Lesson complete",
    className: "celebrate",
    body: h("div.celebrate", h("p.big", xp ? `+${xp.xp} XP` : "Done!"), h("ul", lines.filter(([t]) => !t.startsWith("+")).map(([t, ic]) => h("li", icon(ic), " ", t)))),
    buttons: [{ label: "Back to track", value: "track" }, next ? { label: "Next lesson", value: "next", primary: true } : { label: "Home", value: "home", primary: true }],
  });
  if (choice === "next") location.hash = `#/lesson/${next.id}`;
  else if (choice === "track") location.hash = `#/track/${track.id}`;
  else if (choice === "home") location.hash = "#/";
}

export default async function lesson(main, { track: trackId, slug }) {
  const lesson = lessonById(`${trackId}/${slug}`);
  const track = trackById(trackId);
  if (!lesson) return main.replaceChildren(h("p.empty", "That lesson doesn't exist."));
  const p = profile();
  if (!isUnlocked(p, track, lesson.index)) {
    main.replaceChildren(win("Locked", h("p", "Finish the lesson before this one first."), h("a.btn.primary", { href: `#/track/${track.id}` }, "Back to the track")));
    return;
  }
  main.classList.add("wide");
  const nav = h("div.lesson-nav",
    lesson.index > 0 ? h("a.btn", { href: `#/lesson/${track.lessons[lesson.index - 1].id}` }, "← Previous") : h("a.btn", { href: `#/track/${track.id}` }, "← Track"),
    p.completed[lesson.id] ? h("span.pill", icon("check"), "Done") : h("span.pill", `${lesson.xp} XP`),
    track.lessons[lesson.index + 1] && p.completed[lesson.id] ? h("a.btn", { href: `#/lesson/${track.lessons[lesson.index + 1].id}` }, "Next →") : h("span"));

  const tutorBox = h("div");
  const results = h("div");
  const resultsWin = win("Checks", results);
  resultsWin.hidden = true;
  let lastResult = null;

  const finish = async result => {
    lastResult = result;
    resultsWin.hidden = false;
    renderResults(results, result, { tests: true });
    if (result.timedOut) toastEvents(recordStat(p, "loopsKilled", ctx));
    if (result.pass) {
      const events = completeLesson(p, lesson, ctx);
      changed();
      if (events.length) await celebrate(events, lesson, track);
    } else changed();
  };

  const left = h("div.stack", lessonText(lesson, track), nav);
  let workspace;
  let getCode;
  let cleanup;

  if (lesson.lang === "sh") {
    const { shellWorkspace } = await import("./shell-lesson.js");
    const ws = shellWorkspace({ lesson, profile: p, onChecked: finish, onAttempt: () => recordAttempt(p, lesson.id) });
    workspace = ws.el;
    getCode = ws.getContext;
    cleanup = ws.cleanup;
  } else {
    const runner = runnerFor(lesson.lang);
    const out = h("pre.console", { "aria-label": "Output", "aria-live": "polite" });
    const status = text => out.replaceChildren(h("span.status", text));
    const host = h("div.editor-host");
    const { createEditor } = await import("../editor.js");
    let saveTimer;
    const editor = createEditor(host, {
      lang: lesson.lang,
      doc: await startingCode(p, lesson, track),
      label: `${lesson.title} code editor`,
      onChange: text => { clearTimeout(saveTimer); saveTimer = setTimeout(() => putDraft(p.id, lesson.id, text), 400); },
    });
    getCode = () => ({ code: editor.value, output: out.textContent });
    const log = (text, level, raw) => {
      if (out.querySelector(".status")) out.replaceChildren();
      out.append(h(`span.${level}`, raw ? text : text + "\n"));
      out.scrollTop = out.scrollHeight;
    };
    let busy = false;
    const run = async withTests => {
      if (busy) return;
      busy = true;
      buttons.forEach(b => (b.disabled = true));
      putDraft(p.id, lesson.id, editor.value);
      status("Starting…");
      if (withTests) recordAttempt(p, lesson.id);
      else toastEvents(recordStat(p, "runs", ctx));
      try {
        const result = await runner.run({ code: editor.value, tests: withTests ? lesson.tests : null, seed: lesson.seed }, { onLog: log, onStatus: status });
        if (out.querySelector(".status")) out.replaceChildren();
        if (lesson.lang === "sql" && result.tables) out.replaceChildren(...(result.tables.length ? sqlTables(result.tables) : [h("span.status", "No rows returned.")]));
        if (result.error) out.append(h("span.error", result.error + "\n"));
        else if (!out.textContent && lesson.lang !== "sql") out.append(h("span.status", "(no output)"));
        if (withTests) await finish(result);
        else {
          lastResult = result;
          if (result.timedOut) { toastEvents(recordStat(p, "loopsKilled", ctx)); changed(); }
        }
      } catch (err) {
        out.replaceChildren(h("span.error", `The runner failed: ${err.message}`));
      } finally {
        busy = false;
        buttons.forEach(b => (b.disabled = false));
      }
    };
    const buttons = [
      h("button.btn", { type: "button", onclick: () => run(false), title: "Ctrl+Enter" }, icon("play"), "Run"),
      h("button.btn.primary", { type: "button", onclick: () => run(true), title: "Ctrl+Shift+Enter" }, icon("check"), "Submit"),
      h("button.btn", { type: "button", onclick: async () => {
        if (!(await confirmDialog("Start over", "Replace your code with the starter code?", "Start over"))) return;
        editor.value = lesson.starter ?? "";
        deleteDraft(p.id, lesson.id);
      } }, "Reset"),
    ];
    host.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(e.shiftKey); }
    });
    workspace = h("div.workspace",
      h("section.window", { "aria-label": "Editor" },
        h("div.titlebar", h("span.title-text", `main.${lesson.ext}`), h("span.controls", { "aria-hidden": "true" }, h("span", "_"), h("span", "□"), h("span", "×"))),
        host,
        h("div.toolbar", buttons, h("span.spacer"), h("span.muted", { style: { fontSize: "0.82rem" } }, "Ctrl+Enter runs · Ctrl+Shift+Enter submits"))),
      win("Output", out),
      resultsWin,
      tutorBox);
    status(lesson.lang === "py" ? "Press Run to start Python." : "Press Run to see what your code does.");
    cleanup = () => { clearTimeout(saveTimer); putDraft(p.id, lesson.id, editor.value); editor.destroy(); };
  }

  if (lesson.lang === "sh") workspace.append(resultsWin, tutorBox);
  main.replaceChildren(h("div.lesson-layout", left, workspace));
  import("../tutor/panel.js").then(({ tutorPanel }) => tutorBox.replaceChildren(tutorPanel({
    lesson,
    context: () => ({ ...getCode(), result: lastResult }),
    onHint: () => { toastEvents(recordStat(p, "hints", ctx)); changed(); },
  })));
  return cleanup;
}
