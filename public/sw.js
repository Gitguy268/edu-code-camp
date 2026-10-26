// Offline support. Scoped to the app's own folder, so it never answers for other apps on the same host.
// Pages and the app's code: network first (so updates arrive), cache as the fallback.
// Big runtimes (Pyodide, sql.js, wllama, the Linux image's files, fonts): cache first within one build.
// The image's index, alpine/fs.json, is network first: it changes whenever the image is rebuilt.
// The build replaces this name with one that changes whenever the app does (see vite.config.js).
const CACHE = "edu-code-camp-v1";
const SCOPE = new URL(self.registration.scope).pathname;
const IMMUTABLE = /\/(vendor|alpine|fonts|bios|wallpapers)\//;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const files = await fetch("./precache.json").then(r => r.json()).catch(() => []);
    await cache.addAll(["./", ...files.map(f => "./" + f)]);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("edu-code-camp-v") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || !url.pathname.startsWith(SCOPE)) return;
  if (e.request.headers.has("range")) return;
  if (IMMUTABLE.test(url.pathname) && !url.pathname.endsWith("/fs.json")) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: url.pathname.endsWith("/") || url.pathname.endsWith(".html") }).then(hit => hit || caches.match("./index.html"))));
});
