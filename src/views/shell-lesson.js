// The workspace for Linux lessons: a real shell in the VM, and a Check button that runs the hidden tests.
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { confirmDialog } from "../ui/feedback.js";
import { startVm, hasImage } from "../vm/vm.js";

let vm = null;
const statusListeners = new Set();
let vmStatus = "";
function getVm() {
  vm ??= startVm({ onStatus: s => { vmStatus = s; statusListeners.forEach(fn => fn(s)); } });
  return vm;
}

// Helpers every tests.sh can use. Output lines: PASS<tab>name or FAIL<tab>name<tab>hint.
const PRELUDE = `
pass() { printf 'PASS\\t%s\\n' "$1"; }
fail() { printf 'FAIL\\t%s\\t%s\\n' "$1" "$2"; }
check() { _n=$1; _h=$2; shift 2; if "$@" >/dev/null 2>&1; then pass "$_n"; else fail "$_n" "$_h"; fi; }
as_camper() { su camper -s /bin/sh -c "cd /home/camper && $1"; }
`;

const marker = id => `/var/lib/camp/${id.replace(/[^\w-]/g, "_")}`;
const setupScript = (lesson, force) => `
mkdir -p /var/lib/camp
if ${force ? "true" : `[ ! -f ${marker(lesson.id)} ]`}; then
  cd /home/camper
${lesson.setup ?? ""}
  chown -R camper:camper /home/camper
  touch ${marker(lesson.id)}
fi
echo ok
`;

export function parseChecks(out) {
  const results = [];
  for (const line of out.split("\n")) {
    const [kind, name, hint] = line.split("\t");
    if (kind === "PASS") results.push({ name, pass: true });
    else if (kind === "FAIL") results.push({ name, pass: false, message: hint || "Not yet" });
  }
  return { pass: results.length > 0 && results.every(r => r.pass), results, output: out };
}

export function shellWorkspace({ lesson, onChecked, onAttempt }) {
  const host = h("div.term-host");
  const status = h("p.muted", { role: "status" });
  const check = h("button.btn.primary", { type: "button", disabled: true }, icon("check"), "Check my work");
  const resetFiles = h("button.btn", { type: "button", disabled: true }, "Reset lesson files");
  const el = h("div.workspace",
    h("section.window", { "aria-label": "Terminal" },
      h("div.titlebar", h("span.title-text", "camper@camp: ~"), h("span.controls", { "aria-hidden": "true" }, h("span", "_"), h("span", "□"), h("span", "×"))),
      host,
      h("div.toolbar", check, resetFiles, h("span.spacer"), status)));

  if (!hasImage()) {
    host.replaceChildren(h("p.empty", "The Linux image isn't built into this copy of the app. Run npm run image (needs Docker), then build again."));
    status.textContent = "";
    return { el, getContext: () => ({}), cleanup() {} };
  }

  const term = new Terminal({
    fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    fontSize: 14,
    cursorBlink: true,
    theme: { background: "#0b0e0d", foreground: "#d8f3e3", cursor: "#5fd68a", selectionBackground: "#2f5d46" },
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(host);
  const machine = getVm();
  machine.attach(term);
  if (vmStatus === "ready") machine.send("\x0c");
  const onData = term.onData(d => machine.send(d));
  const refit = () => { try { fit.fit(); machine.resize(); } catch { /* hidden */ } };
  const ro = new ResizeObserver(refit);
  ro.observe(host);

  let ready = false;
  const showStatus = s => {
    if (s.startsWith("error:")) status.textContent = `Couldn't start Linux: ${s.slice(6)}`;
    else if (s !== "ready") status.textContent = s;
  };
  statusListeners.add(showStatus);
  showStatus(vmStatus || "Starting Linux…");

  const setup = async force => {
    status.textContent = "Preparing the lesson files…";
    await machine.run(setupScript(lesson, force));
    // Hide the boot messages the first time: the lesson starts at a clean prompt.
    if (!ready) { term.clear(); machine.send("\x0c"); }
    ready = true;
    check.disabled = resetFiles.disabled = false;
    status.textContent = "Linux is ready. Type in the terminal.";
    term.focus();
  };
  machine.agentReady().then(() => setup(false)).catch(err => { status.textContent = err.message; });

  let lastOut = "";
  check.onclick = async () => {
    if (!ready) return;
    check.disabled = true;
    status.textContent = "Checking…";
    onAttempt();
    try {
      lastOut = await machine.run(PRELUDE + (lesson.tests ?? ""));
      await onChecked(parseChecks(lastOut));
      status.textContent = "";
    } catch (err) {
      status.textContent = err.message;
    } finally {
      check.disabled = false;
    }
  };
  resetFiles.onclick = async () => {
    if (await confirmDialog("Reset lesson files", "Put this lesson's files back the way they started? Other files stay as they are.", "Reset")) setup(true);
  };

  return {
    el,
    getContext: () => ({ code: "(the learner works in a shell)", output: lastOut }),
    cleanup() {
      statusListeners.delete(showStatus);
      onData.dispose();
      ro.disconnect();
      machine.detach();
      machine.save();
      term.dispose();
    },
  };
}
