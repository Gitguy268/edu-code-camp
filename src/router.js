// Hash routes, so the app works from any folder on GitHub Pages or a local server.
const routes = [];
export const route = (pattern, view) => routes.push({ re: new RegExp(`^${pattern.replace(/:(\w+)/g, "(?<$1>[^/]+)")}$`), view });
export const go = path => { location.hash = "#" + path; };
export const currentPath = () => location.hash.slice(1) || "/";

let cleanup = null;
export function startRouter(render) {
  const run = async () => {
    const path = currentPath();
    for (const r of routes) {
      const m = r.re.exec(path);
      if (!m) continue;
      for (const d of document.querySelectorAll("dialog[open]")) d.close();
      cleanup?.();
      cleanup = null;
      cleanup = (await render(r.view, { ...m.groups }, path)) ?? null;
      return;
    }
    go("/");
  };
  addEventListener("hashchange", run);
  run();
}
