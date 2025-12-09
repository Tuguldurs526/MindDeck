// apps/server/src/services/sm2Service.ts

// Single place that owns SM-2 math for Minddeck.
// Uses a 0–3 quality scale:
//   0 = Again  (complete failure)
//   1 = Hard   (barely remembered)
//   2 = Good
//   3 = Easy

export type Sm2State = {
  reps: number; // number of successful reviews
  interval: number; // days
  ease: number; // SM-2 ease factor, usually starts at 2.5
  due: Date; // next due date
};

export function advanceSm2(state: Sm2State, quality: number, now = new Date()): Sm2State {
  // clamp quality to 0–3
  const q = Math.max(0, Math.min(3, Math.floor(quality)));

  const prevEase = state.ease ?? 2.5;
  const prevReps = state.reps ?? 0;
  const prevInterval = state.interval ?? 0;

  let ease = prevEase;
  let reps = prevReps;
  let interval = prevInterval;

  // --- Ease factor update (adapted SM-2) ---
  // treat 0/1 as "worse", 2 as "good", 3 as "easy"
  // this keeps ease in a sensible range
  const difficulty = 3 - q; // 3→0, 2→1, 1→2, 0→3
  ease = ease + (0.1 - difficulty * (0.08 + difficulty * 0.02));
  if (ease < 1.3) ease = 1.3;

  // --- Failure path (Again / Hard) ---
  if (q < 2) {
    // You failed or barely remembered the card.
    // Reset reps; show again soon, but NOT immediately.
    reps = 0;
    interval = 0;

    // e.g. 5 minutes later instead of "right now"
    const due = new Date(now.getTime() + 5 * 60 * 1000);

    return {
      reps,
      interval,
      ease,
      due,
    };
  }

  // --- Success path (Good / Easy) ---
  reps = reps + 1;

  if (reps === 1) {
    interval = 1; // 1 day
  } else if (reps === 2) {
    interval = 3; // 3 days
  } else {
    interval = Math.round(interval * ease);
    if (interval < 1) interval = 1;
  }

  const due = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    reps,
    interval,
    ease,
    due,
  };
}
