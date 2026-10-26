// Spot, the camp's tutor: the author's black labrador with her red collar. Drawn for edu-code-camp.
import { svg } from "./dom.js";

export const spot = (cls = "mascot", label = "Spot the labrador") => svg(`
<svg class="${cls}" viewBox="0 0 120 120" role="img" aria-label="${label}">
  <circle cx="60" cy="60" r="58" fill="var(--mascot-bg, color-mix(in srgb, var(--accent) 16%, var(--surface)))"/>
  <path d="M26 46c-6 14-4 34 6 40 6 3 10-6 10-16 0-12-4-26-16-24z" fill="#141414"/>
  <path d="M94 46c6 14 4 34-6 40-6 3-10-6-10-16 0-12 4-26 16-24z" fill="#141414"/>
  <path d="M60 22c-20 0-32 14-32 34 0 14 6 24 14 30h36c8-6 14-16 14-30 0-20-12-34-32-34z" fill="#1d1d1f"/>
  <path d="M40 84c4 10 12 14 20 14s16-4 20-14z" fill="#1d1d1f"/>
  <ellipse cx="60" cy="74" rx="17" ry="13" fill="#2a2a2d"/>
  <ellipse cx="60" cy="67" rx="7.5" ry="5.5" fill="#050505"/>
  <ellipse cx="57.5" cy="65.5" rx="2.2" ry="1.4" fill="#5a5a5e"/>
  <path d="M60 72v5M52 79c4 3 12 3 16 0" stroke="#050505" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="47" cy="52" r="5" fill="#3b2412"/><circle cx="73" cy="52" r="5" fill="#3b2412"/>
  <circle cx="48.4" cy="50.4" r="1.6" fill="#fff"/><circle cx="74.4" cy="50.4" r="1.6" fill="#fff"/>
  <path d="M38 92c6 6 14 9 22 9s16-3 22-9l3 8c-7 6-16 9-25 9s-18-3-25-9z" fill="#d8342f"/>
  <circle cx="60" cy="106" r="5" fill="#e6c229" stroke="#8a6a00" stroke-width="1.5"/>
</svg>`);

export const logo = () => svg(`
<svg class="logo" viewBox="0 0 32 32" aria-hidden="true">
  <path d="M16 3L3 27h26z" fill="var(--logo-tent, var(--accent))"/>
  <path d="M16 11l-6 16h12z" fill="var(--logo-door, var(--surface))"/>
  <path d="M12.5 18l-2 2 2 2M19.5 18l2 2-2 2" stroke="var(--logo-tent, var(--accent))" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);
