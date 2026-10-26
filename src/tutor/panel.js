// The "Ask Spot" window under each lesson. The model downloads only when the learner asks for it.
import { h } from "../ui/dom.js";
import { spot } from "../ui/mascot.js";
import { confirmDialog } from "../ui/feedback.js";
import { createEngine, isModelCached, deleteModel, modelSizeLabel, isAbortError, MODEL_NAME } from "./runtime.js";
import { buildMessages, cleanReply } from "./prompt.js";

// Inline `code` in a reply shows as code; everything else stays plain text.
const rich = text => text.split(/(`[^`\n]+`)/).map(part => (/^`[^`]+`$/.test(part) ? h("code", part.slice(1, -1)) : part));

let engine = null;
let loading = null;
let abort = null;
const histories = new Map();

export function tutorPanel({ lesson, context, onHint }) {
  const history = histories.get(lesson.id) ?? [];
  histories.set(lesson.id, history);
  const body = h("div.window-body");
  const el = h("section.window", { "aria-label": "Ask Spot" },
    h("div.titlebar", h("span.title-text", "Ask Spot"), h("span.controls", { "aria-hidden": "true" }, h("span", "?"), h("span", "×"))),
    body);

  const head = text => h("div.spot-head", spot("mascot", "Spot"), h("p", { style: { margin: 0 } }, text));

  async function paint() {
    if (engine) return paintChat();
    if (loading) {
      body.replaceChildren(head("Spot is waking up…"));
      loading.then(paintChat, paint);
      return;
    }
    const cached = await isModelCached().catch(() => false);
    body.replaceChildren(
      head(cached
        ? "Spot is asleep on this device. Wake Spot up to get hints."
        : `Spot gives hints, not answers, and runs entirely on your device. Spot thinks with ${MODEL_NAME}, a ${modelSizeLabel()} download from Hugging Face that stays in this browser afterwards.`),
      h("div.row", { style: { marginTop: "10px" } },
        h("button.btn.primary", { type: "button", onclick: wake }, cached ? "Wake Spot" : `Download Spot (${modelSizeLabel()})`),
        cached ? h("button.btn.small", { type: "button", onclick: async () => {
          if (await confirmDialog("Delete Spot's model", `Remove the ${modelSizeLabel()} model from this browser? You can download it again later.`, "Delete")) { await deleteModel(); paint(); }
        } }, "Delete model") : null));
  }

  async function wake() {
    const bar = h("div.bar", h("span"));
    const note = h("p.muted", "Starting…");
    abort = new AbortController();
    body.replaceChildren(head("Waking Spot…"), bar, note,
      h("div.row", { style: { marginTop: "8px" } }, h("button.btn.small", { type: "button", onclick: () => abort.abort() }, "Pause")));
    loading = createEngine(p => {
      bar.firstChild.style.width = `${Math.floor((p.loadedBytes / p.totalBytes) * 100)}%`;
      note.textContent = p.loadedBytes < p.totalBytes ? `Downloading ${Math.round(p.loadedBytes / 1e6)} of ${Math.round(p.totalBytes / 1e6)} MB` : "Loading the model…";
    }, abort.signal);
    try {
      engine = await loading;
    } catch (err) {
      loading = null;
      if (isAbortError(err)) return paint();
      body.replaceChildren(head(`Spot couldn't wake up: ${err.message}`), h("button.btn", { type: "button", onclick: wake }, "Try again"));
      return;
    }
    loading = null;
    paintChat();
  }

  const log = h("div.tutor-log", { "aria-live": "polite" });
  const input = h("input", { type: "text", placeholder: "Ask Spot about this lesson…", "aria-label": "Your question for Spot", style: { flex: "1", minWidth: "180px" } });
  let busy = false;

  function bubble(who, text) {
    const b = h(`div.bubble.${who}`, rich(text));
    log.append(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  async function ask(question) {
    if (busy || !question.trim()) return;
    busy = true;
    bubble("me", question);
    const reply = bubble("spot", "…");
    onHint?.();
    let text = "";
    const stop = new AbortController();
    try {
      await engine.chat(buildMessages(lesson, context(), history, question), d => {
        text += d;
        reply.replaceChildren(...rich(cleanReply(text)));
        log.scrollTop = log.scrollHeight;
      }, stop.signal);
      const clean = cleanReply(text) || "Woof? Try asking that another way.";
      reply.replaceChildren(...rich(clean));
      history.push({ role: "user", content: question }, { role: "assistant", content: clean });
    } catch (err) {
      reply.textContent = `Spot got distracted: ${err.message}`;
    } finally {
      busy = false;
    }
  }

  function paintChat() {
    log.replaceChildren(...history.map(m => h(`div.bubble.${m.role === "user" ? "me" : "spot"}`, rich(m.content))));
    if (!history.length) log.append(h("div.bubble.spot", "Woof! Stuck? Ask me and I'll point you the right way. I won't spoil the answer."));
    body.replaceChildren(log,
      h("div.row",
        h("button.btn.small", { type: "button", onclick: () => ask("Give me a small hint for the next step.") }, "Give me a hint"),
        h("button.btn.small", { type: "button", onclick: () => ask("What does my error or failing check mean?") }, "Explain my error"),
        h("button.btn.small", { type: "button", onclick: () => ask("Explain the idea of this lesson in simpler words.") }, "Explain the idea")),
      h("form.row", { style: { marginTop: "8px" }, onsubmit: e => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); } },
        input, h("button.btn.primary", { type: "submit" }, "Ask")));
  }

  paint();
  return el;
}
