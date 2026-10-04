import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9.5h18M8 3v3M16 3v3" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconPin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M21.5 20a6.5 6.5 0 00-4-6" /></svg>
);
export const IconPlay = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>
);
export const IconTable = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M3 15h18M9.5 4v16" /></svg>
);
export const IconCloud = (p: P) => (
  <svg {...base(p)}><path d="M7 18.5h10.5a4 4 0 00.6-7.95A6 6 0 006.4 9.6 4.5 4.5 0 007 18.5z" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base(p)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const IconQuote = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}><path d="M9.6 6C6.5 7.3 4.5 10 4.5 13.6V18h5.6v-5.4H7.4c.1-2 1.2-3.6 3.2-4.6zm9 0c-3.1 1.3-5.1 4-5.1 7.6V18h5.6v-5.4h-2.7c.1-2 1.2-3.6 3.2-4.6z" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" /></svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}><path d="M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 006 6l1.4-2.2 4.5 1.5V18a2.5 2.5 0 01-2.5 2.5A16.5 16.5 0 012.5 6 2.5 2.5 0 015 3.5z" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="M9 5l7 7-7 7" /></svg>
);
export const IconHandshake = (p: P) => (
  <svg {...base(p)}><path d="M3 12l4-4 4 2 3-3 3 1 4 4M7 16l2 2a1.5 1.5 0 002 0l4-4M11 18l1 1a1.5 1.5 0 002 0l3-3M3 12l4 4" /></svg>
);
export const IconExternal = (p: P) => (
  <svg {...base(p)}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg>
);
export const IconLinkedIn = (p: P) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}><path d="M4.98 3.5a2.5 2.5 0 11.02 5 2.5 2.5 0 01-.02-5zM3 9.5h4v11H3zm7 0h3.8v1.6h.05c.53-1 1.84-2.05 3.8-2.05 4.05 0 4.8 2.67 4.8 6.13v5.32h-4v-4.72c0-1.13-.02-2.58-1.57-2.58-1.58 0-1.82 1.23-1.82 2.5v4.8H10z" /></svg>
);
