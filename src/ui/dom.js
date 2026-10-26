// h("div.card#main", { onclick }, ...children): a small element builder.
export function h(tag, props, ...children) {
  const [, name = "div", rest = ""] = /^([\w-]*)(.*)$/.exec(tag);
  const el = document.createElement(name || "div");
  for (const m of rest.matchAll(/([.#])([\w-]+)/g)) {
    if (m[1] === ".") el.classList.add(m[2]);
    else el.id = m[2];
  }
  if (props && (typeof props !== "object" || props instanceof Node || Array.isArray(props))) {
    children.unshift(props);
    props = null;
  }
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v;
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...children.flat(Infinity).filter(c => c != null && c !== false).map(c => (c instanceof Node ? c : document.createTextNode(String(c)))));
  return el;
}

export const svg = markup => {
  const t = document.createElement("template");
  t.innerHTML = markup.trim();
  return t.content.firstChild;
};
