// Single place that owns SM-2 math.
// If you already have a pure helper (e.g. utils/sm2.ts), import and re-export.
// Otherwise this is a minimal, tested-correct implementation.

export type Sm2State = {
  reps: number; // number of successful reviews
  interval: number; // days
  ease: number; // SM-2 ease factor, usually starts at 2.5
  due: Date; // next due date
};

export function advanceSm2(
  state: Sm2State,
  quality: number,
  now = new Date()
): Sm2State {
  const q = Math.max(0, Math.min(5, Math.floor(quality)));

  // failure path
  if (q < 3) {
    return {
      reps: 0,
      interval: 1,
      ease: Math.max(1.3, state.ease ?? 2.5),
      due: new Date(now.getTime() + 24 * 3600 * 1000),
    };
  }

  const prevEase = state.ease ?? 2.5;
  const nextEase = Math.max(
    1.3,
    prevEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  let nextReps = (state.reps ?? 0) + 1;
  let nextInterval: number;
  if (nextReps === 1) nextInterval = 1;
  else if (nextReps === 2) nextInterval = 6;
  else nextInterval = Math.round((state.interval ?? 6) * nextEase);

  return {
    reps: nextReps,
    interval: nextInterval,
    ease: nextEase,
    due: new Date(now.getTime() + nextInterval * 24 * 3600 * 1000),
  };
}



