// Centralized motion language. framer-motion timings + reusable variants so
// every animation in the app shares the same feel (fast, 150-250ms, snappy).
// Import these instead of hand-writing transitions in components.
//
// For reduced-motion, components call framer-motion's useReducedMotion() and
// pass `instant` where appropriate; index.css also kills CSS transitions.

// Easing curves mirror the CSS --ease-* tokens.
export const EASE = [0.22, 1, 0.36, 1]; // snap / out-quint-ish

export const T = {
  fast: { duration: 0.15, ease: EASE },
  base: { duration: 0.22, ease: EASE },
  slow: { duration: 0.32, ease: EASE },
  // Springs for things that move / reorder (layout, nodes, pointers).
  spring: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  springSoft: { type: "spring", stiffness: 260, damping: 26 },
  instant: { duration: 0 },
};

// Common enter/exit variants. Spread into a motion element:
//   <motion.div {...fade} transition={T.base} />
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.82 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.82 },
};

// A value box / node arriving into a structure.
export const nodeIn = {
  initial: { opacity: 0, scale: 0.6, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.6, y: 6 },
};

// Staggered container for grids / lists.
export const stagger = (gap = 0.03) => ({
  animate: { transition: { staggerChildren: gap } },
});

// Page-level route transition.
export const page = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
