// Inline icons, drawn for edu-code-camp. They use currentColor so every look can recolour them.
import { svg } from "./dom.js";

const paths = {
  flame: '<path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.4 2.2-3.2C17.6 10.6 19 13 19 15.5 19 19.6 15.9 22 12 22s-7-2.4-7-6.5C5 10 11 8 12 2z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18 3-18" fill="none" stroke="var(--icon-line, rgba(0,0,0,.35))" stroke-width="1.2"/>',
  chest: '<path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v1H3z"/><rect x="3" y="12" width="18" height="8" rx="1.5"/><rect x="10.5" y="10" width="3" height="5" rx="1" fill="var(--icon-line, rgba(0,0,0,.4))"/>',
  star: '<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  check: '<path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  paw: '<ellipse cx="12" cy="16" rx="5" ry="4.2"/><circle cx="5.5" cy="10" r="2.2"/><circle cx="18.5" cy="10" r="2.2"/><circle cx="9" cy="5.8" r="2.2"/><circle cx="15" cy="5.8" r="2.2"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  trophy: '<path d="M7 3h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H3.5a3.5 3.5 0 0 0 4 4.5M17 5h3.5a3.5 3.5 0 0 1-4 4.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.5" y="12" width="3" height="5"/><rect x="7" y="17" width="10" height="3" rx="1"/>',
  terminal: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l3 3-3 3M11 15h6" fill="none" stroke="var(--icon-line, rgba(255,255,255,.9))" stroke-width="2" stroke-linecap="round"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  palette: '<path d="M12 2a10 10 0 1 0 0 20c1.4 0 2-1 2-2 0-1.5-1.3-1.8-1.3-3 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5C22 5.8 17.5 2 12 2z"/><circle cx="7" cy="11" r="1.6" fill="var(--icon-line, #fff)"/><circle cx="10" cy="6.5" r="1.6" fill="var(--icon-line, #fff)"/><circle cx="15.5" cy="6.5" r="1.6" fill="var(--icon-line, #fff)"/>',
};

export const icon = (name, label) =>
  svg(`<svg class="icon icon-${name}" viewBox="0 0 24 24" fill="currentColor" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${paths[name]}</svg>`);
