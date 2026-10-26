// The Linux lessons' VM: Alpine Linux (i386) in v86, adapted from TabShell's src/vm.js.
// The learner's shell runs on the virtio console; lesson setup and checks go over the serial port
// to camp-agent (image/camp-agent), so they never show up in the terminal.
import { V86 } from "v86";
import wasmUrl from "v86/build/v86.wasm?url";

const BASE = import.meta.env.BASE_URL;
const DB = "edu-code-camp-vm";
const KEY = "vm-state";
const SAVE_WHEN_QUIET_MS = 5_000;
const END = "@@CAMP-END@@";
const READY = "@@CAMP-READY@@";

const idb = (mode, fn) => new Promise((resolve, reject) => {
  const open = indexedDB.open(DB, 1);
  open.onupgradeneeded = () => open.result.createObjectStore("state");
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const tx = open.result.transaction("state", mode);
    const req = fn(tx.objectStore("state"));
    tx.oncomplete = () => { open.result.close(); resolve(req.result); };
    tx.onerror = tx.onabort = () => { open.result.close(); reject(tx.error); };
  };
});
// A state from an older image would point at files that no longer exist, so it's only used on the same image.
const loadState = () => idb("readonly", s => s.get(KEY)).catch(() => undefined);
const storeState = buf => idb("readwrite", s => s.put({ image: __IMAGE_ID__, buf }, KEY));
export const clearVmState = () => idb("readwrite", s => s.delete(KEY));

const b64 = text => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
const unb64 = text => new TextDecoder().decode(Uint8Array.from(atob(text), c => c.charCodeAt(0)));

export function hasImage() {
  return __IMAGE_ID__ !== "none";
}

/** Starts the VM. term: an xterm.js Terminal (can be swapped later with attach()). */
export function startVm({ onStatus }) {
  let emulator, term = null, dirty = false, saving = null, stopped = false, quiet, input = new Uint8Array(0), flushing = false;
  let agentReady, agentResolve, serialBuf = "", pending = null;
  const backlog = [];
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  agentReady = new Promise(r => (agentResolve = r));
  // v86 0.5.463 writes this pair into the Linux resize message in reverse, so rows go first to arrive as cols×rows.
  const resize = () => term && emulator?.bus.send("virtio-console0-resize", [term.rows, term.cols]);

  // v86 drops console input when the guest has no receive buffer posted, which loses fast typing and pastes.
  // So input waits in a queue until the receive queue has room.
  // shortcut: reads v86 internals (v86.cpu.devices.virtio_console), recheck when upgrading v86.
  const touch = () => { dirty = true; clearTimeout(quiet); quiet = setTimeout(save, SAVE_WHEN_QUIET_MS); };
  const rxReady = () => emulator?.v86?.cpu?.devices?.virtio_console?.virtio?.queues[0]?.has_request() ?? true;
  function flush() {
    flushing = false;
    while (input.length && emulator && rxReady()) {
      emulator.bus.send("virtio-console0-input-bytes", input.subarray(0, 512));
      input = input.subarray(512);
    }
    if (input.length && !stopped) { flushing = true; setTimeout(flush, 5); }
  }
  function send(data) {
    touch();
    const bytes = enc.encode(data);
    const merged = new Uint8Array(input.length + bytes.length);
    merged.set(input);
    merged.set(bytes, input.length);
    input = merged;
    if (!flushing) flush();
  }

  async function save() {
    if (!emulator || !dirty || saving || stopped) return saving;
    dirty = false;
    saving = emulator.save_state().then(storeState).catch(err => { dirty = true; console.warn("edu-code-camp: saving the VM failed", err); })
      .finally(() => { saving = null; });
    return saving;
  }
  const onHidden = () => document.visibilityState === "hidden" && save();

  function onSerial(byte) {
    serialBuf += String.fromCharCode(byte);
    if (serialBuf.endsWith(READY + "\n") || serialBuf.endsWith(READY + "\r\n")) {
      serialBuf = "";
      agentResolve();
      return;
    }
    const at = serialBuf.indexOf(END);
    if (at === -1) return;
    const body = serialBuf.slice(0, at).replace(/\s+/g, "");
    serialBuf = serialBuf.slice(at + END.length).replace(/^\r?\n/, "");
    const p = pending;
    pending = null;
    p?.resolve(body ? unb64(body) : "");
    agentResolve();
  }

  // One script at a time; camp-agent runs it as root in /home/camper and sends back its output.
  let queue = Promise.resolve();
  function runScript(script, timeoutMs = 20_000) {
    const job = queue.then(() => new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending = null; reject(new Error("The Linux checker didn't answer")); }, timeoutMs);
      pending = { resolve: v => { clearTimeout(timer); resolve(v); } };
      emulator.serial0_send(b64(script) + "\n");
    }));
    queue = job.catch(() => {});
    return job;
  }

  async function boot() {
    const stored = await loadState();
    const saved = stored?.image === __IMAGE_ID__ ? stored.buf : undefined;
    if (stopped) return;
    onStatus(saved ? "Restoring your Linux machine…" : "Booting Linux… (the first boot takes about 30 seconds)");
    emulator = new V86({
      wasm_path: wasmUrl,
      bios: { url: BASE + "bios/seabios.bin" },
      vga_bios: { url: BASE + "bios/vgabios.bin" },
      memory_size: 256 * 1024 * 1024,
      vga_memory_size: 2 * 1024 * 1024,
      bzimage_initrd_from_filesystem: true,
      cmdline: "rw root=host9p rootfstype=9p rootflags=trans=virtio,cache=loose modules=virtio_pci tsc=reliable console=hvc0",
      filesystem: { baseurl: BASE + "alpine/flat/", basefs: BASE + "alpine/fs.json" },
      initial_state: saved ? { buffer: saved } : undefined,
      virtio_console: true,
      disable_keyboard: true,
      disable_mouse: true,
      autostart: true,
    });
    emulator.add_listener("serial0-output-byte", onSerial);
    let ready = false;
    emulator.add_listener("virtio-console0-output-bytes", bytes => {
      touch();
      const text = dec.decode(bytes, { stream: true });
      if (term) term.write(text);
      else backlog.push(text);
      if (!ready) { ready = true; onStatus("ready"); resize(); }
    });
    if (saved) {
      emulator.add_listener("emulator-started", () => {
        onStatus("ready");
        resize();
        // The agent was already waiting when the state was saved.
        agentResolve();
        // Ctrl+L makes the shell redraw its prompt in the empty terminal.
        send("\x0c");
      });
    }
    document.addEventListener("visibilitychange", onHidden);
  }

  boot().catch(err => onStatus("error:" + err.message));

  return {
    send,
    resize,
    agentReady: () => agentReady,
    run: async (script, timeoutMs) => { await agentReady; return runScript(script, timeoutMs); },
    attach(t) {
      term = t;
      for (const text of backlog.splice(0)) term.write(text);
      resize();
    },
    detach() { term = null; },
    save,
    async reset() {
      stopped = true;
      clearTimeout(quiet);
      document.removeEventListener("visibilitychange", onHidden);
      await saving;
      await emulator?.destroy();
      await clearVmState();
    },
  };
}
